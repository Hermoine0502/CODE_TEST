var carStatus = {};
var oilsetDefaultValue = ""; //車子油量起始值
function ChineseDatePicker() {
  $.extend($.datepicker, chineseSetting);
  $(".ChineseDatepicker").datepicker({
    changeMonth: true,
    changeYear: true,
    altField: "#hiddenFrom",
    altFormat: "yymmdd",
    dateFormat: 'yy/mm/dd',
  });
}
function DatePicker() {
  $.extend($.datepicker, ENSetting);
  $(".ENDatepicker").datepicker({
    changeMonth: true,
    changeYear: true,
    altField: "#hiddenFrom",
    altFormat: "yymmdd",
    dateFormat: 'yy/mm/dd',
  })
}
$(document).ready(function () {
  //==== 車籍管理 AddCar searchCarManage ====
  // 搜尋頁面載入
  $.get("components/searchCarManage.html", function (data) {
    $("#searchCarManage").html($.parseHTML(data));
    codeDetail('21', "#DepartmentSearch");//車籍所屬部門
    codeDetail('04', "#car_speciesSearch");//車種
    codeDetail('25', "#rent_statusSearch");//租車狀態
    DatePicker("#StartDateSearch");//日期起
    DatePicker("#EndDateSearch");//日期迄
    $("#StartDateSearch").val("").prop("disabled", true);
    $("#EndDateSearch").val("").prop("disabled", true);
    $('#SelectorSearch').on('change', async function () {
      if ($('#SelectorSearch').val() !== "") {
        $("#StartDateSearch").prop("disabled", false);
        $("#EndDateSearch").prop("disabled", false);
        $("#IsDeal").prop("disabled", false);
      } else {
        $("#StartDateSearch").val("").prop("disabled", true);
        $("#EndDateSearch").val("").prop("disabled", true);
        $("#IsDeal").val("").prop("disabled", true);
      };
    });
    //部門下拉規則
    $('#DepartmentSearch').on('change', async function () {
      let cdc_id = $('#DepartmentSearch').val();
      let objselect = { cc_id: '21', cdc_id: cdc_id, };
      let res = await CarselectAPI._getPositionMenu(objselect);
      await getPositionMenu(res.data, "#DepartmentSearch", "#PositionSearch");
      $("#rent_statusSearch").val('');
      $("#rent_statusSearch").prop("disabled", true);
      $("#rent_statusSearch > option").addClass("d-none").prop("disabled", true);
      $("#rent_statusSearch option:first").removeClass("d-none").prop("disabled", false);
      let DepartmentSearch = $(this).val();
      if (DepartmentSearch == '02') {
        $("#rent_statusSearch").prop("disabled", false);
        $("#rent_statusSearch > option[value^='2']").removeClass("d-none").prop("disabled", false);
      } else if (DepartmentSearch == '01') {
        $("#rent_statusSearch").prop("disabled", false);
        $("#rent_statusSearch > option[value^='1']").removeClass("d-none").prop("disabled", false);
      } else {
        $("#rent_statusSearch").val('');
      };
    });
    //調撥頁面跳轉
    let carTransferNo = localStorage.getItem("data-carNo");
    console.log(carTransferNo);
    let carTransferinfo = localStorage.getItem("data-carinfo");
    console.log(carTransferinfo);
    if (carTransferNo !== null) {
      searchCar();
      CarManageinfo(carTransferNo, carTransferinfo);
      localStorage.removeItem('data-carNo');
      localStorage.removeItem('data-carinfo');
    };
    //維保頁面跳轉
    if (sessionStorage.getItem("Schedule") != null) {
      let obj = JSON.parse(sessionStorage.getItem("Schedule"));
      console.log(obj.id);
      console.log(obj.Carinfo);
      console.log(obj.No);
      console.log(obj);
      switch (obj.schedule_type) {
        case "Update":
          (async () => {
            if (obj.id !== null) {
              // searchCar();
              await CarManageinfo(obj.No, obj.Carinfo);
              if (obj.isfinished == 'Y') {
                await CarwarrantyDetail(obj.id)
              } else {
                await WarrantyUpdate(obj.id, obj.Carinfo)
              };
              sessionStorage.removeItem("Schedule");
            };
          })()
          break;
        case "Create":
          if (obj.id !== null) {
            (async () => {
              // searchCar();
              await CarManageinfo(obj.No, obj.Carinfo, async function () {
                // $('#pills-tab a[href="#pills-record"]').tab('show');
                await WarrantyAddbtn(
                  obj.Carinfo,
                  async function () {
                    console.log("帶值");
                    $("#Warranty_CarPlate_number > option[value='" + obj.car_license + "']").prop("selected", true)
                    // $("#engine_number").val(obj.engine_number);
                    $("#dateStart").val(dateFormatSendBack(obj.date_start, 8));
                    sessionStorage.removeItem("Schedule");
                  }
                );
              })
            })()
          }
          break;
        case "TransferCreate":
          if (obj.id !== null) {
            (async () => {
              searchCar();
              // await CarManageinfo(obj.No, obj.Carinfo);
              let item = ([obj.Carinfo])
              await TransferAddbtn(item, async function () {
                //帶值 
                console.log("帶值");
                // $("#engine_number").val(obj.engine_number);
                $("#Tra_date").val(dateFormatSendBack(obj.take_time, 8))
                sessionStorage.removeItem("Schedule");
              })
            })()
          }
      }
    }
    //車籍搜尋
    $('#searchCars').on('click', async function () {
      searchCar();
      await clearInputCol();
    });
    //清空調撥model
    $('#Transfer').on('hidden.bs.modal', function (e) {
      $("#Tra_Department").val("");
      $("#Tra_Position").val("");
      $("#Driver").val("");
      $("#Tra_date").val("");
      $("#Tra_timeStart").val("");
      $("#ExArrive_date").val("");
      $("#Arrive_timEend").val("");
      $("#out_remark").val("");
    });
    //清空賣出model  
    $('#Sale').on('hidden.bs.modal', function (e) {
      $("#Sale_Company").val("");
      $("#Sale_Price").val("");
      $("#Sell_date").val("");
      $("#Sell_remark").val("");
    })
    //清空罰單model  
    $('#Ticket').on('hidden.bs.modal', function (e) {
      $("#divResult").val("");
      $("#TicketInput").val("")
      $(".barcode").val("")
      $('#Ticket #tblResult').html("");
    })
  });
  // 新增車籍頁面載入
  $("#contain").on("click", ".Add-btn", function (e) {
    e.stopPropagation();
    $.get("components/CarManageCreate.html?V=20200205", function (data) {
      $("#CarManageDetail").html($.parseHTML(data));
      DetailPage._on();
      clearInputCol(); //清空輸入欄位 
      getCarManageDetail();//下拉資訊
      DatePicker("#buy_date");
      codeDetail('23', "#CarPlateType");//車牌種類
      $("#pills-profile-tab").on("click", async function () {
        ChineseDatePicker(".ChineseDatepicker");
      });
      $("#pills-home-tab").on("click", async function () {
        DatePicker("#buy_date");
      });
      $('.selectpicker').selectpicker('val', '');
      $(".filter-option-inner-inner").text("請選擇");
      getLongContract_idMenu("", "")//長租合約編號下拉
      getShortContract_idMenu($("#ShortContract_id"))//短租合約編號下拉
      $("#oil_car").text("4");
      oilsetting("car");
      $(".next-btn").on('click', function () {
        $('#pills-tab a[href="#pills-profile"]').tab('show')
        ChineseDatePicker(".ChineseDatepicker");
      });//下一步
      $('#btn-create-ok').off('click').on('click', async function () {
        let check_result = await checkForm();
        if (check_result) {
          $("#btn-create-ok").prop("disabled", true);
          await createCar();
          $("#btn-create-ok").prop("disabled", false);
        } else {
          AlertModal({
            message: "請檢查必填欄位",
            second: 1500
          })
        }
      });
    });
  });
  //匯出excel
  $("#contain").on("click", "#btn-export", async function (e) {
    e.stopPropagation();
    console.log(255)
    CarinfoListExport();
  });

  //匯出罰單
  $("#contain").on("click", "#btn-ticket", async function (e) {
    e.preventDefault();
    // $('#Ticket #tblResult').html("");
    // $("#TicketInput").val("");
    await $("#Ticket").modal("show")
    setTimeout(function () {
      $("#dateLast").focus();
    }, 500)

    $("#Ticket .barcode").unbind('keyup').bind('keyup', async function (e) {
      console.log(e.keyCode);
      if ((e.keyCode == 13 || e.keyCode == undefined)) {
        console.log($(this).parent().next().find(".barcode").length);
        if ($(this).parent().next().find(".barcode").length == 1) {
          $(this).parent().next().find(".barcode").focus();
        } else if (checkInput()) {

          let seq = 0;
          seq = $("#tblResult tr").length;

          let arrDate = $("#dateLast").val().split('D');
          let lastDate = "1" + arrDate[0];
          let arrLastDate = arrDate[0].match(/.{1,2}/g);
          let calDate = (parseInt(arrLastDate[0]) + 100 + 1911) + "-" + arrLastDate[1] + "-" + arrLastDate[2];
          console.log("calDate:" + calDate);

          let arrplateAmt = $("#plateAmt").val().split('+');
          let plateNo = arrplateAmt[0] + "-" + arrplateAmt[1].substr(arrplateAmt[1].length - 9, 4);

          let amt = parseInt($("#plateAmt").val().substr($("#plateAmt").val().length - 5));

          let ticketNo = $("#ticketNo").val();

          var d = new Date(calDate);
          d.setDate(d.getDate() - parseInt(arrDate[1]));
          console.log(d);

          let objselect = { CarPlate_number: plateNo };
          let res = await CarselectAPI._getTicket(objselect);
          let data = res.data;
          console.log(res)
          console.log(data)
          if (res.success) {
            let trAdd = '';
            let copy = "";
            if (data.length > 0) {
              data.forEach(i => {
                trAdd += `<tr>
                                <td>${seq}</td>
                                <td>${plateNo}</td>
                                <td>${ticketNo}</td>
                                <td></td>
                                <td>${i.L_Customer_name}</td>
                                <td>${i.CustomerID}</td>
                                <td>${i.TicketAddressPC}</td>
                                <td>${i.Ticket_city}${i.Ticket_area}${i.TicketAddress}</td>
                                <td>V</td>
                                <td>V</td>
                                <td>${amt}</td>
                                <td onclick="removeTR(this)"><i class="fas fa-times text-danger"></i></td>
                            </tr>`;
                copy += `${seq}\t${plateNo}\t${ticketNo}\t　\t${i.L_Customer_name}\t${i.CustomerID}\t${i.TicketAddressPC}\t${i.Ticket_city}${i.Ticket_area}${i.TicketAddress}\tV\tV\t\n`;
              });
            } else {
              alert("查無此車牌號碼");
            }
            $('#Ticket #tblResult').append(trAdd);
            console.log(copy);
            let valA = $("#TicketInput").val();
            let toInput = valA + copy;
            $("#TicketInput").val(toInput);
            $(".barcode").val("").first().focus();
          }
        }
      }
    });
    $("#btn-ticket-cancel").off("click").on('click', async function (e) {
      console.log(222)
    });
    $("#TicketCopy").on('click', async function (e) {
      showTicket()
      let copyText = document.getElementById("TicketInput");
      copyText.select();
      copyText.setSelectionRange(0, 99999)
      document.execCommand("copy");
      alert("已複製");
    });
  });
  //調出頁面
  $("#contain").on("click", "#btn_Transfer", async function (e) {
    e.stopPropagation();
    let item = $('input:checkbox:checked[name="checkedNormal"]').map(function () { return $(this).val(); }).get();
    console.log(item);
    TransferAddbtn(item);
    // $('#cartransferdetail .TransferSearchDeatil').html("");
    // await $("#Transfer").modal("show")
    // await $(".Status").val('調出');
    // await DatePicker("#Tra_date");
    // await DatePicker("#ExArrive_date");
    // await TimePicker("#Tra_timeStart");
    // await TimePicker("#Arrive_timEend");
    // await codeDetail('21', "#Tra_Department"); //調撥公司
    // await $('#Tra_Department').on('change', async function () {
    //   let cdc_id = $('#Tra_Department').val();
    //   let objselect = { cc_id: '21', cdc_id: cdc_id, };
    //   let res = await CarselectAPI._getPositionMenu(objselect);
    //   getPositionMenu(res.data, "#Tra_Department", "#Tra_Position");
    // });
    // $(".alertEmptyCol").remove();
    // let item = $('input:checkbox:checked[name="checkedNormal"]').map(function () { return $(this).val(); }).get();
    // console.log(item)
    // item.forEach(async function (item) {
    //   var objSearch = {
    //     Carinfo_id: item
    //   }
    //   console.log(objSearch)
    //   let res = await CarManageAPI._Search(objSearch);
    //   let data = res.data;
    //   console.log(res)
    //   if (res.success) {
    //     let trAdd = '';
    //     if (data.data.length > 0) {
    //       data.data.forEach(i => {
    //         trAdd +=
    //           `<tr class="text-center">
    //               <td>${i.LicensePlateNumber}</td>
    //               <td>${i.VIN}</td>
    //               <td>${i.Brand}&emsp;${i.CarModelCodeDescription}</td>
    //               <td>${i.CarColorCodeDescription}</td>
    //               </tr>`;
    //       });
    //     } else {
    //       trAdd +=
    //         `<tr class="text-center">
    //             <th colspan="20" class="text-center">無符合條件資料</th>
    //          </tr>`;
    //     }
    //     $('#cartransferdetail .TransferSearchDeatil').append(trAdd);
    //     //滑動table至頂

    //     $('#contain').animate({ scrollTop: 300 }, 500);
    //   } else {
    //     await AlertModal({
    //       message: res.message,
    //       second: 0
    //     });
    //     console.error(res, res.message);
    //   }
    // });
    // //確定建立調撥單
    // $("#btn-Transfer-ok").off("click").on('click', async function (e) {
    //   console.log(222)
    //   e.stopPropagation();
    //   let item = $('input:checkbox:checked[name="checkedNormal"]').map(function () { return $(this).val(); }).get();
    //   var obj = {
    //     Carinfo_id: item,
    //     Tra_Department: $("#Tra_Department").val(),
    //     Tra_Position: $("#Tra_Position").val(),
    //     Driver: $("#Driver").val(),
    //     Tra_date: dateRegex($("#Tra_date").val(), $("#Tra_timeStart").val()),
    //     Arrive_date: dateRegex($("#ExArrive_date").val(), $("#Arrive_timEend").val()),
    //     out_remark: $("#out_remark").val(),
    //   };
    //   console.log(obj)
    //   if (confirm('確認內容無誤?')) {
    //     let res = await CarTransferAPI._Create(obj);
    //     if (res.success) {
    //       await AlertModal({
    //         message: res.message,
    //         second: 1500
    //       });
    //     } else console.error(res);
    //     await $("#Transfer").modal("hide")
    //     searchCar();
    //   } else {
    //     return false
    //   }
    // });
  });
  //賣出頁面
  $("#contain").on("click", "#btn_Sale", async function (e) {
    e.stopPropagation();
    $('#carSaledetail .SaleSearchDeatil').html("");
    await $("#Sale").modal("show")
    await DatePicker("#Sell_date");
    await $(".Status").val('賣出');
    $(".alertEmptyCol").remove();
    let item = $('input:checkbox:checked[name="checkedNormal"]').map(function () { return $(this).val(); }).get();
    console.log(item)
    item.forEach(async function (item) {
      var objSearch = {
        Carinfo_id: item
      }
      console.log(objSearch)
      let res = await CarManageAPI._Search(objSearch);
      let data = res.data;
      console.log(res)
      if (res.success) {
        let trAdd = '';
        if (data.data.length > 0) {
          data.data.forEach(i => {
            trAdd +=
              `<tr class="text-center">
                  <td>${i.LicensePlateNumber}</td>
                  <td>${i.VIN}</td>
                  <td>${i.Brand}&emsp;${i.CarModelCodeDescription}</td>
                  <td>${i.CarColorCodeDescription}</td>
                  </tr>`;
          });
        } else {
          trAdd +=
            `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
        }
        $('#carSaledetail .SaleSearchDeatil').append(trAdd);
        //滑動table至頂
        $('#contain').animate({ scrollTop: 300 }, 500);
      } else {
        await AlertModal({
          message: res.message,
          second: 0
        });
        console.error(res, res.message);
      }
    });

    //確定賣出車輛
    $("#btn-Sale-ok").off("click").on('click', async function (e) {
      console.log(222)
      e.stopPropagation();
      let item = $('input:checkbox:checked[name="checkedNormal"]').map(function () { return $(this).val(); }).get();
      var obj = {
        Carinfo_id: item,
        Sale_Company: $("#Sale_Company").val(),
        Sale_Price: $("#Sale_Price").val().trim() == "" ? "0" : $("#Sale_Price").val().trim(),
        Sell_date: $("#Sell_date").val().replace(/-/g, ''),
        Sell_remark: $("#Sell_remark").val(),
      };
      console.log(obj)
      if (confirm('確認內容無誤?')) {
        let res = await CarSaleAPI._Update(obj);
        if (res.success) {
          await AlertModal({
            message: res.message,
            second: 1500
          });
        } else console.error(res);
        await $("#Sale").modal("hide")
        searchCar();
      } else {
        return false;
      }
    });
  });
  // 車籍修改
  $("#contain").on("click", ".btn-edit", function (e) {
    e.stopPropagation();
    let thisID = $(this).attr("data-carid");
    console.log(thisID)
    let thisinfoID = $(this).attr("data-carinfo");
    console.log(thisinfoID)
    CarManageinfo(thisID, thisinfoID);
  });
  // 車籍明細
  $("#contain").on("click", ".btn-eye", function (e) {
    e.stopPropagation();
    let thisID = $(this).attr("data-carid");
    console.log(thisID)
    let thisinfoID = $(this).attr("data-carinfo");
    console.log(thisinfoID)
    CarManageinfoDetail(thisID, thisinfoID);
  });
  // 車籍刪除
  $("#contain").on("click", ".btn-delete", async function (e) {
    e.stopPropagation();
    let objDel = {
      userid: USERID,
      No: $(this).attr("data-carid")
    };
    console.log(objDel);
    if (confirm('確定刪除?')) {
      let res = await CarManageAPI._Delete(objDel);
      console.log(res);
      // 提醒刪除成功
      await AlertModal({
        message: res.message,
        second: 1500
      });
      if (res.success) searchCar();
      else console.error(res);
    } else {
      return false;
    };
  });
});
//調撥頁面
async function TransferAddbtn(item, cb = null) {
  $('#cartransferdetail .TransferSearchDeatil').html("");
  await $("#Transfer").modal("show")
  await $(".Status").val('調出');
  await DatePicker("#Tra_date");
  await DatePicker("#ExArrive_date");
  await TimePicker("#Tra_timeStart");
  await TimePicker("#Arrive_timEend");
  await codeDetail('21', "#Tra_Department"); //調撥公司
  await $('#Tra_Department').on('change', async function () {
    let cdc_id = $('#Tra_Department').val();
    let objselect = { cc_id: '21', cdc_id: cdc_id, };
    let res = await CarselectAPI._getPositionMenu(objselect);
    getPositionMenu(res.data, "#Tra_Department", "#Tra_Position");
  });
  $(".alertEmptyCol").remove();
  item.forEach(async function (item) {
    var objSearch = {
      Carinfo_id: item
    }
    console.log(objSearch)
    let res = await CarManageAPI._Search(objSearch);
    let data = res.data;
    console.log(res)
    if (res.success) {
      let trAdd = '';
      if (data.data.length > 0) {
        data.data.forEach(i => {
          trAdd +=
            `<tr class="text-center">
                  <td>${i.LicensePlateNumber}</td>
                  <td>${i.VIN}</td>
                  <td>${i.Brand}&emsp;${i.CarModelCodeDescription}</td>
                  <td>${i.CarColorCodeDescription}</td>
                  </tr>`;
        });
      } else {
        trAdd +=
          `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
      }
      $('#cartransferdetail .TransferSearchDeatil').append(trAdd);
      //滑動table至頂

      $('#contain').animate({ scrollTop: 300 }, 500);
    } else {
      await AlertModal({
        message: res.message,
        second: 0
      });
      console.error(res, res.message);
    }
  });
  if (cb !== null) await cb();
  //確定建立調撥單
  $("#btn-Transfer-ok").off("click").on('click', async function (e) {
    console.log(222)
    e.stopPropagation();
    let item = $('input:checkbox:checked[name="checkedNormal"]').map(function () { return $(this).val(); }).get();
    var obj = {
      Carinfo_id: item,
      Tra_Department: $("#Tra_Department").val(),
      Tra_Position: $("#Tra_Position").val(),
      Driver: $("#Driver").val(),
      Tra_date: dateRegex($("#Tra_date").val(), $("#Tra_timeStart").val()),
      Arrive_date: dateRegex($("#ExArrive_date").val(), $("#Arrive_timEend").val()),
      out_remark: $("#out_remark").val(),
    };
    console.log(obj)
    if (confirm('確認內容無誤?')) {
      let res = await CarTransferAPI._Create(obj);
      if (res.success) {
        await AlertModal({
          message: res.message,
          second: 1500
        });
      } else console.error(res);
      await $("#Transfer").modal("hide")
      searchCar();
    } else {
      return false
    }
  });
}

//詳細車籍頁面載入
async function CarManageinfo(id, idinfo, cb = null) {
  $.get("components/CarManageDetail.html", function (data) {
    $("#CarManageDetail").html($.parseHTML(data));
    $(".alertEmptyCol").remove();
    (async () => {
      await codeDetail('23', "#CarPlateTypeDetail");//車牌種類
      await getCarManageDetail();
      await detailCar(id);
      await DatePicker("#buy_date");

      $("#pills-profile-tab").on("click", async function () {
        ChineseDatePicker(".ChineseDatepicker");
      });
      $("#pills-home-tab").on("click", async function () {
        DatePicker("#buy_date");
      });
      $(".next-btn-detail").on('click', function () {
        $('#pills-tab a[href="#pills-profile"]').tab('show')
        ChineseDatePicker(".ChineseDatepicker");
      });//下一步
      await DetailPage._on(function () {
        let name = $("#Department").val();
        console.log(name)
        if ($("#Brand").val() == 'VOLVO' && $("#VIN").val() != "") {
          $("#VIN").prop("disabled", true);
        } else {
          $("#VIN").prop("disabled", false);
        }
        $("#rent_status").prop("disabled", true);
        $("#rent_status > option").addClass("d-none").prop("disabled", true);
        $("#rent_status option:first").removeClass("d-none").prop("disabled", false);
        if (name == '02') {
          $("#shortrent").removeClass('d-none');
          $("#longrent").addClass('d-none');
          $("#rent_status").prop("disabled", false);
          $("#rent_status > option[value^='2']").removeClass("d-none").prop("disabled", false);
        } else if (name == '01') {
          $("#rent_status").prop("disabled", false);
          $("#rent_status > option[value^='1']").removeClass("d-none").prop("disabled", false);
          $("#shortrent").addClass('d-none');
          $("#longrent").removeClass('d-none');
        } else {
          $("#shortrent").addClass('d-none');
          $("#longrent").removeClass('d-none');
        };
      });
      if (cb !== null) await cb();
    })()
    $('#btn-update-ok').on('click', async function () {
      let check_result = await checkForm();
      if (check_result) {
        await updateCar(id);
        await DetailPage._off();
      } else {
        AlertModal({
          message: "請檢查必填欄位",
          second: 1500
        })
      };
    })
    // 子頁面
    $("#pills-record-tab").on("click", async function () {
      let PT = localStorage.getItem('PT');
      console.log(PT)
      // 渲染畫面
      if (PT == "01") {
        $("#W_LongContract_id").removeClass('d-none')
        // if ($("#warranty_LongContract_id").val() !== "" || $("#warranty_LongContract_id").val() !== null) {
        await getWarranty_LongContract("#warranty_LongContract_id", idinfo);
        // } else {
        //   let select = "";
        //   select += `<option value="0">查無長租合約</option>`;
        //   $("#warranty_LongContract_id").html(select);
        // }
      } else {
        $("#W_LongContract_id").addClass('d-none')
        $("#warrantyStartdate").val('')
        $("#warrantyEnddate").val('')
      };
      await DatePicker("#warrantyEnddate");
      await DatePicker("#warrantyStartdate");
      // 搜尋畫面
      let Brand = localStorage.getItem('Brand');
      if (Brand == 'VOLVO') {
        searchWarrantyByCSS(idinfo);
        $("#tab_byASAP").on("click", async function () {
          searchWarranty(idinfo);
        });
        $("#tab_byCSS").on("click", async function () {
          searchWarrantyByCSS(idinfo);
        });
      } else {
        $("#tab_byCSS").addClass('d-none')
        $("#WArranty_byASAP").addClass('show')
        $("#WArranty_byCSS").removeClass('active')
        $("#WArranty_byASAP").addClass('active')
        await searchWarranty(idinfo);
      };
      // 搜尋項目改變
      $("#warranty_LongContract_id").on("change", async function () {
        let value = $("#warranty_LongContract_id").val()
        let startdate = $("#warranty_LongContract_id option[value='" + value + "']").attr("data-start")
        let enddate = $("#warranty_LongContract_id option[value='" + value + "']").attr("data-end")
        $("#warrantyStartdate").val(startdate)
        $("#warrantyEnddate").val(enddate)
        await searchWarranty(idinfo);
      });
      $("#warrantyStartdate ,#warrantyEnddate").on("change", async function () {
        await searchWarranty(idinfo);
      });
      $("#warrantyStartdate_ByCss ,#warrantyEnddate_ByCss").on("change", async function () {
        await searchWarrantyByCSS(idinfo);
      });
    });
    $("#pills-Plate-tab").on("click", async function () {
      searchPlate(idinfo);
    });
    $("#pills-transform-tab").on("click", async function () {
      searchTransfer(idinfo);
    });
    $("#pills-Insurance-tab").on("click", async function () {
      searchInsurance(idinfo);
    });
    $("#pills-JunctionTable-tab").on("click", async function () {
      searchJunction(idinfo);
    });
    $("#pills-lossadvice-tab").on("click", async function () {
      searchLossadvice(idinfo);
    });
    $("#pills-Pledge-tab").on("click", async function () {
      searchPledge(idinfo);
    });

    // 新增維修保養頁面載入
    $("#pills-record").on("click", "#add_Warranty", async function (e) {
      e.stopPropagation();
      $.get("components/CarWarrantyCreate.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        clearInputCol(false, "#CarOtherDetail .Warrantyrow"); //清空輸入欄位 
        $("#broker").val(sessionStorage.name); //經手人
        //下拉選項
        DatePicker("#dateStart");
        DatePicker("#dateEnd");
        TimePicker("#timeStart");
        TimePicker("#timeEnd");
        let PT = localStorage.getItem('PT');
        console.log(PT)
        let me = "";
        if (PT == "02") {
          $("#W_LongContract_id").addClass('d-none')
          $(".mileageFrom").removeClass('d-none')
          me += `<label class="input-group-text d-block w-100 required" for="mileage_start">出發里程</label>`;
        } else {
          $("#W_LongContract_id").removeClass('d-none')
          $(".mileageFrom").addClass('d-none')
          me += `<label class="input-group-text d-block w-100 required" for="mileage_start">本次進廠里程</label>`;
        } $('.mileagetotal').html(me);
        getPlate_id(idinfo, "#Warranty_CarPlate_number");
        //長租為記錄功能
        let LongContract = localStorage.getItem('LC');
        console.log(LongContract)
        $('#workType').on('change', async function () {
          let workType = $('#workType').val();
          if (workType == "1") {
            if (LongContract == 'null') {
              $("#LongContract_id").prop("disabled", false).val("");
            } else $("#LongContract_id").prop("disabled", false).val(LongContract);
          }
          else {
            $("#LongContract_id").prop("disabled", true).val("");
          }
        });
        OtherDetailPage._on({ selector: "#CarOtherDetail" });
        $('#btn-createWarranty-ok').on('click', async function () {
          let check_result = await WarrantycheckForm();
          if (check_result) {
            await createCarWarranty(idinfo);
            // let Brand = localStorage.getItem('Brand');
            // if (Brand == 'VOLVO') {
            //   await searchWarrantyByCSS(idinfo);
            // } else {
            await searchWarranty(idinfo);
            // };
            await OtherDetailPage._off({ selector: "#CarOtherDetail" });
          } else {
            AlertModal({
              message: "請檢查必填欄位",
              second: 1500
            })
          }
        });
      });
    });
    // 保養修改
    $("#pills-record #WArranty_byASAP").on("click", ".btn-Warranty-edit", async function (e) {
      e.stopPropagation();
      let WarrantythisID = $(this).attr("data-cwid");
      console.log(WarrantythisID);
      WarrantyUpdate(WarrantythisID, idinfo)
      // $.get("components/CarWarrantyDetail.html", function (data) {
      //   $("#CarOtherDetail").html($.parseHTML(data));
      //   $(".alertEmptyCol").remove();
      //   (async () => {
      //     await DatePicker("#dateStart");
      //     await DatePicker("#dateEnd");
      //     await TimePicker("#timeStart");
      //     await TimePicker("#timeEnd");
      //     await detailCarWarranty(WarrantythisID);
      //     await SerchWarrantypdf(WarrantythisID);
      //     $("#upadteWarranty").on("change", async function () {
      //       let trNote = '';
      //       let files = $("#upadteWarranty")[0].files;
      //       if (files.length > 0) {
      //         if (files[0].type.toLowerCase().indexOf("pdf") >= 0) {
      //           trNote += `<a class="m-2">${files[0].name}</a>`;
      //         } else {
      //           alert("請上傳PDF!!");
      //         }
      //       } else {
      //         trNote += '<a class="m-2">尚無重新上傳資料</a>';
      //       }
      //       $('#Warrantyfile').html(trNote);
      //     });
      //     await OtherDetailPage._on({ selector: "#CarOtherDetail" });
      //   })()
      //   $('#btn-updataWarranty-ok').on('click', async function () {
      //     let check_result = await WarrantycheckForm();
      //     if (check_result) {
      //       await updateCarWarranty(WarrantythisID);
      //       // let Brand = localStorage.getItem('Brand');
      //       // if (Brand == 'VOLVO') {
      //       //   await searchWarrantyByCSS(idinfo);
      //       // } else {
      //       await searchWarranty(idinfo);
      //       // };
      //       await OtherDetailPage._off({ selector: "#CarOtherDetail" });
      //     } else {
      //       AlertModal({
      //         message: "請檢查必填欄位",
      //         second: 1500
      //       })
      //     };
      //   });
      //   $('#btn-warranty-finished').off('click').on('click', async function (e) {
      //     e.stopPropagation();
      //     var obj = {
      //       CarWarranty_id: WarrantythisID,
      //       ischecked: 'Y'
      //     };
      //     console.log(obj)
      //     let res = await CarWarrantyAPI._UpdateCheck(obj);
      //     if (res.success) {
      //       await AlertModal({
      //         message: res.message,
      //         second: 1500
      //       });
      //     } else console.error(res);
      //     await $('#Check').modal('hide');
      //     await OtherDetailPage._off({ selector: "#CarOtherDetail" });
      //     await searchWarranty(idinfo);
      //   });
      //   $("#Warrantyfile").on("click", ".btn-WarrantyDelete_pdf", async function () {
      //     let objDel = {
      //       id: WarrantythisID,
      //       content: $(this).parents("#Warrantyfile").eq(0).find("a").attr('name'),
      //       isadmin: "Y",
      //     }
      //     console.log(objDel);
      //     if (confirm('確定刪除?')) {
      //       let res = await ImgAPI._delete(objDel);
      //       console.log(res);
      //       // 提醒刪除成功
      //       await AlertModal({
      //         message: res.message,
      //         second: 1500
      //       });
      //       if (res.success) SerchWarrantypdf(WarrantythisID);
      //       else console.error(res);
      //     } else {
      //       return false;
      //     };
      //   })
      // });
    });
    //保養明細
    $("#pills-record #WArranty_byASAP").on("click", ".btn-CarWarranty-eye", async function (e) {
      e.stopPropagation();
      let WarrantythisID = $(this).attr("data-cwid");
      console.log(WarrantythisID);
      CarwarrantyDetail(WarrantythisID)
      // $.get("components/CarWarrantyDetail.html", function (data) {
      //   $("#CarOtherDetail").html($.parseHTML(data));
      //   $(".alertEmptyCol").remove();
      //   (async () => {
      //     await detailCarWarranty(WarrantythisID);
      //     await SerchWarrantypdf(WarrantythisID);
      //     $("#warrantyitem input").prop("disabled", true);
      //     $("#warrantyitem textarea").prop("disabled", true);
      //     $("#btn-updataWarranty-ok").addClass("d-none")
      //     $(".btn-finish").addClass("d-none")
      //     $(".btn-WarrantyDelete_pdf").addClass("d-none")
      //     await OtherDetailPage._on({ selector: "#CarOtherDetail" });
      //   })()
      // });
    });
    // 保養刪除
    $("#pills-record #WArranty_byASAP").on("click", ".btn-Warranty-delete", async function (e) {
      e.stopPropagation();
      let objDel = {
        userid: USERID,
        CarWarranty_id: $(this).attr("data-CWid")
      };
      console.log(objDel);
      if (confirm('確定刪除?')) {
        let res = await CarWarrantyAPI._Delete(objDel);
        console.log(res);
        // 提醒刪除成功
        await AlertModal({
          message: res.message,
          second: 1500
        });
        if (res.success) {
          // let Brand = localStorage.getItem('Brand');
          // if (Brand == 'VOLVO') {
          //   await searchWarrantyByCSS(idinfo);
          // } else {
          await searchWarranty(idinfo);
          // };
        }
        else console.error(res);
      } else {
        return false;
      };
    });
    // 新增掛牌頁面載入
    $("#pills-Plate").on("click", "#add_Plate", async function (e) {
      e.stopPropagation();
      $.get("components/CarPlateCreate.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        //下拉日期選單
        clearInputCol(false, "#CarOtherDetail .Platerow"); //清空輸入欄位
        ChineseDatePicker(".ChineseDatePicker");
        codeDetail('23', "#PCarPlateType");//車牌種類
        $('.selectpicker').selectpicker('val', '');
        $(".filter-option-inner-inner").text("請選擇");
        let VIN = localStorage.getItem('VIN');
        if (VIN !== null) {
          $('.VIN').val(VIN);
        } else {
          $('.VIN').val('');
        };
        OtherDetailPage._on({ selector: "#CarOtherDetail" });
        $('#btn-createPlate-ok').on('click', async function () {
          let check_result = await PlatecheckForm();
          if (check_result) {
            await createCarPlate(idinfo, id);
            await OtherDetailPage._off({ selector: "#CarOtherDetail" });
            await searchPlate(idinfo);
            await detailCar(id)
            await searchCar();
          } else {
            AlertModal({
              message: "請檢查必填欄位",
              second: 1500
            })
          }
        });
      });
    });
    // 掛牌修改
    $("#pills-Plate").on("click", ".btn-Plate-edit", function (e) {
      e.stopPropagation();
      let PlatethisID = $(this).attr("data-carplateid");
      console.log(PlatethisID)
      $.get("components/CarPlateDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          await ChineseDatePicker(".ChineseDatePicker");//下拉日期選單
          await codeDetail('23', "#PCarPlateType");//車牌種類
          await detailCarPlate(PlatethisID);
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
        $('#btn-updataPlate-ok').on('click', async function () {
          let check_result = await PlatecheckForm();
          if (check_result) {
            await updateCarPlate(PlatethisID, idinfo, id);
            await OtherDetailPage._off({ selector: "#CarOtherDetail" });
            await searchPlate(idinfo);
            await detailCar(id)
            await searchCar();
          } else {
            AlertModal({
              message: "請檢查必填欄位",
              second: 1500
            })
          };
        })
      });
    });
    // 掛牌刪除
    $("#pills-Plate").on("click", ".btn-Plate-delete", async function (e) {
      e.stopPropagation();
      let objDel = {
        userid: USERID,
        CarPlate_id: $(this).attr("data-carplateid"),
        Carinfo_id: idinfo,
        No: id
      };
      console.log(objDel);
      if (confirm('確定刪除?')) {

        let res = await CarPlateAPI._Delete(objDel);
        console.log(res);
        // 提醒刪除成功
        await AlertModal({
          message: res.message,
          second: 1500
        });
        if (res.success) {
          await searchPlate(idinfo);
          await detailCar(id)
          await searchCar();
        } else console.error(res);
      } else {
        return false;
      };
    });
    // 新增保險頁面載入
    $("#pills-Insurance").on("click", "#add_Insurance", async function (e) {
      e.stopPropagation();
      $.get("components/CarInsuranceCreate.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        //下拉日期選單
        clearInputCol(false, "#CarOtherDetail.Insurancerow"); //清空輸入欄位 
        ChineseDatePicker(".ChineseDatePicker");
        codeDetail('24', "#insurance_type");//險種
        getPlate_id(idinfo, "#Insurance_CarPlate_number")
        let Plate = localStorage.getItem('LP');
        if (Plate !== "") {
          getLongContract("#InContract", Plate);
          $('#Insurance_CarPlate_number,#InRent_type').on('change', async function () {
            let Plate = $("#Insurance_CarPlate_number").val();
            let Rent_type = $('#InRent_type').val();
            if (Rent_type == "0") {
              getLongContract("#InContract", Plate);
            }
            else if (Rent_type == "1") {
              getShortContract("#InContract", Plate, "");
            }
          });
        } else {
          let select = "";
          select += `<option value="0">查無合約</option>`;
          $("#InContract").html(select);
        }
        OtherDetailPage._on({ selector: "#CarOtherDetail" });
        $('#btn-createInsurance-ok').on('click', async function () {
          let check_result = await InsurancecheckForm();
          if (check_result) {
            await createCarInsurance();
            await searchInsurance(idinfo);
            await OtherDetailPage._off({ selector: "#CarOtherDetail" });
            await searchCar();
          } else {
            AlertModal({
              message: "請檢查必填欄位",
              second: 1500
            })
          }
        });
      });
    });
    // 保險修改
    $("#pills-Insurance").on("click", ".btn-Insurance-edit", function (e) {
      e.stopPropagation();
      let InsurancethisID = $(this).attr("data-CarInsuranceid");
      console.log(InsurancethisID);
      $.get("components/CarInsuranceDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          await ChineseDatePicker(".ChineseDatePicker");//下拉日期選單
          await codeDetail('24', "#insurance_type");//險種
          await detailCarInsurance(InsurancethisID);
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
        $('#btn-updataInsurance-ok').on('click', async function () {
          await updateCarInsurance(InsurancethisID);
          await searchInsurance(idinfo);
          await OtherDetailPage._off({ selector: "#CarOtherDetail" });
        })
      });
    });
    // 保險刪除
    $("#pills-Insurance").on("click", ".btn-Insurance-delete", async function (e) {
      e.stopPropagation();
      let objDel = {
        userid: USERID,
        CarInsurance_id: $(this).attr("data-CarInsuranceid")
      };
      console.log(objDel);
      if (confirm('確定刪除?')) {
        console.log('deleteplat')
        let res = await CarInsuranceAPI._Delete(objDel);
        console.log(res);
        // 提醒刪除成功
        await AlertModal({
          message: res.message,
          second: 1500
        });
        if (res.success) searchInsurance(idinfo);
        else console.error(res);
      } else {
        return false;
      };
    });
    // 新增出險頁面載入
    $("#pills-lossadvice").on("click", "#add_lossadvice", async function (e) {
      e.stopPropagation();
      $.get("components/CarLossadviceCreate.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        //下拉日期選單
        clearInputCol(false, "#CarOtherDetail.Lossadvicerow"); //清空輸入欄位 
        codeDetail('31', "#LossType");//出險種類
        DatePicker("#Accident_date");
        getPlate_id(idinfo, "#LACarPlate_number");
        let Plate = localStorage.getItem('LP');
        if (Plate !== "") {
          getLongContract("#ContractID", Plate);
          getInsurance_id(idinfo, Plate, "#CarInsuranceID", $('#Rent_type').val());
          $('#LACarPlate_number,#Rent_type').on('change', async function () {
            let Plate = $("#LACarPlate_number").val();
            let Rent_type = $('#Rent_type').val();
            await getInsurance_id(idinfo, Plate, "#CarInsuranceID", Rent_type);
            if (Rent_type == "0") {
              getLongContract("#ContractID", Plate);
            }
            else if (Rent_type == "1") {
              getShortContract("#ContractID", Plate, "1");
            }
          });
        } else {
          let select = "";
          let selectIN = "";
          select += `<option value="0">查無合約</option>`;
          selectIN += `<option value="0">查無保險</option>`;
          $("#ContractID").html(select);
          $("#CarInsuranceID").html(selectIN);
        }
        OtherDetailPage._on({ selector: "#CarOtherDetail" });
        $('#btn-createLossadvice-ok').on('click', async function () {
          let check_result = await LossadvicecheckForm();
          if (check_result) {
            await createCarLossadvice();
            await searchLossadvice(idinfo);
            await OtherDetailPage._off({ selector: "#CarOtherDetail" });
            await searchCar();
          } else {
            AlertModal({
              message: "請檢查必填欄位",
              second: 1500
            })
          }
        });
      });
    });
    // 出險修改
    $("#pills-lossadvice").on("click", ".btn-Lossadvice-edit", function (e) {
      e.stopPropagation();
      let LossadvicethisID = $(this).attr("data-carlossadviceid");
      console.log(LossadvicethisID);
      $.get("components/CarLossadviceDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          await ChineseDatePicker(".ChineseDatePicker");//下拉日期選單
          await codeDetail('31', "#LossType");//出險種類
          await DatePicker("#Accident_date");
          await detailCarLossadvice(LossadvicethisID);
          await Serchlosspdf(LossadvicethisID);
          $("#upadteLOSS").on("change", async function () {
            let trNote = '';
            let files = $("#upadteLOSS")[0].files;
            if (files.length > 0) {
              if (files[0].type.toLowerCase().indexOf("pdf") >= 0) {
                trNote += `<a class="m-2">${files[0].name}</a>`;
              } else {
                alert("請上傳PDF!!");
              }
            } else {
              trNote += '<a class="m-2">尚無重新上傳資料</a>';
            }
            $('#Lossfile').html(trNote);
          });
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
        $('.btn-updataLossadvice-ok').on('click', async function () {
          await updateCarLossadvice(LossadvicethisID);
          await searchLossadvice(idinfo);
          await OtherDetailPage._off({ selector: "#CarOtherDetail" });
        })
        $("#Lossfile").on("click", ".btn-LossDelete_pdf", async function () {
          let objDel = {
            id: LossadvicethisID,
            content: $(this).parents("#Lossfile").eq(0).find("a").attr('name'),
            isadmin: "Y",
          }
          console.log(objDel);
          if (confirm('確定刪除?')) {
            let res = await ImgAPI._delete(objDel);
            console.log(res);
            // 提醒刪除成功
            await AlertModal({
              message: res.message,
              second: 1500
            });
            if (res.success) Serchlosspdf(LossadvicethisID);
            else console.error(res);
          } else {
            return false;
          };
        })
      });
    });
    // 出險刪除
    $("#pills-lossadvice").on("click", ".btn-Lossadvice-delete", async function (e) {
      e.stopPropagation();
      let objDel = {
        userid: USERID,
        CarLossAdvice_id: $(this).attr("data-carlossadviceid")
      };
      console.log(objDel);
      if (confirm('確定刪除?')) {
        console.log('deleteplat')
        let res = await CarLossAdviceAPI._Delete(objDel);
        console.log(res);
        // 提醒刪除成功
        await AlertModal({
          message: res.message,
          second: 1500
        });
        if (res.success) searchLossadvice(idinfo);
        else console.error(res);
      } else {
        return false;
      };
    });
    // 新增牌登質押頁面載入
    $("#pills-Pledge").on("click", "#add_Pledge", async function (e) {
      e.stopPropagation();
      $.get("components/CarPledgeCreate.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        clearInputCol(false, "#CarOtherDetail .Pledgerow"); //清空輸入欄位 
        $("#broker").val(sessionStorage.name); //經手人
        //下拉選項
        DatePicker("#PledgeDate");
        DatePicker("#PledgeBack");
        getPlate_id(idinfo, "#Pledge_CarPlate_number");
        OtherDetailPage._on({ selector: "#CarOtherDetail" });
        $('#btn-createPledge-ok').on('click', async function () {
          let check_result = await PledgecheckForm();
          if (check_result) {
            await createCarPledge();
            await searchPledge(idinfo);
            await OtherDetailPage._off({ selector: "#CarOtherDetail" });
          } else {
            AlertModal({
              message: "請檢查必填欄位",
              second: 1500
            })
          }
        });
      });
    });
    // 牌登質押修改
    $("#pills-Pledge").on("click", ".btn-Pledge-edit", async function (e) {
      e.stopPropagation();
      let PledgethisID = $(this).attr("data-CPLid");
      console.log(PledgethisID);
      $.get("components/CarPledgeDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          await DatePicker("#PledgeDate");
          await DatePicker("#PledgeBack");
          await detailCarPledge(PledgethisID);
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
        $('#btn-updataPledge-ok').on('click', async function () {
          let check_result = await PledgecheckForm();
          if (check_result) {
            await updateCarPledge(PledgethisID);
            await searchPledge(idinfo);
            await OtherDetailPage._off({ selector: "#CarOtherDetail" });
          } else {
            AlertModal({
              message: "請檢查必填欄位",
              second: 1500
            })
          };
        });
      });
    });
    // 牌登質押刪除
    $("#pills-Pledge").on("click", ".btn-Pledge-delete", async function (e) {
      e.stopPropagation();
      let objDel = {
        userid: USERID,
        CarPledge_id: $(this).attr("data-CPLid")
      };
      console.log(objDel);
      if (confirm('確定刪除?')) {
        let res = await CarPledgeAPI._Delete(objDel);
        console.log(res);
        // 提醒刪除成功
        await AlertModal({
          message: res.message,
          second: 1500
        });
        if (res.success) searchPledge(idinfo);
        else console.error(res);
      } else {
        return false;
      };
    });
    // 新增聯合表頁面載入
    $("#btn_Long").on("click", async function (e) {
      e.stopPropagation();
      await $("#addLong_juntion").modal("show")
      // $('.selectpicker').selectpicker('val', '');
      // $(".filter-option-inner-inner").text("請選擇");
      let Plate = localStorage.getItem('LP');
      if (Plate !== null) {
        $('.CarPlate_number').val(Plate);
      } else {
        $('.CarPlate_number').val('');
      };

      //選取案件編號
      $("#addLong_juntion .btn-Long-ok").attr("disabled", "true");
      $("#OrderID option").remove();
      $("#Long_ContractID").on("change", function () {
        let ContracID = $("#Long_ContractID").val()
        if (ContracID !== "") {
          $("#OrderID").prop("disabled", false);
          getLongOrder("#OrderID", ContracID).then(function () {
            if ($("#OrderID option").length > 0 && $("#OrderID option").eq(0).val() != "") {
              $("#addLong_juntion .btn-Long-ok").removeAttr("disabled");
            }
          });
        }
      });
      console.log(Plate)
      // getLongContract_idMenu("", "");
      $('.btn-Long-ok').off("click").on('click', async function () {
        let check_result = await L_JunctioncheckForm();
        if (check_result) {
          $(".btn-Long-ok").prop("disabled", true);
          await createLongJunction(idinfo);
          await searchJunction(idinfo);
          $("#addLong_juntion").modal('hide')
          $(".btn-Long-ok").prop("disabled", false);
          await detailCar(id)
          await searchCar();
        } else {
          AlertModal({
            message: "請檢查必填欄位",
            second: 1500
          })
        }
      });
    });
    $("#btn_Short").on("click", async function (e) {
      e.stopPropagation();
      await $("#addShort_juntion").modal("show")
      // $('.selectpicker').selectpicker('val', '');
      // $(".filter-option-inner-inner").text("請選擇");
      let Plate = localStorage.getItem('LP');
      if (Plate !== null) {
        $('.CarPlate_number').val(Plate);
      } else {
        $('.CarPlate_number').val('');
      };
      // getLongContract_idMenu("", "");
      $('.btn-Short-ok').off("click").on('click', async function () {
        let check_result = await S_JunctioncheckForm();
        if (check_result) {
          $(".btn-Short-ok").prop("disabled", true);
          await createShortJunction(idinfo);
          await searchJunction(idinfo);
          $("#addShort_juntion").modal('hide');
          $(".btn-Short-ok").prop("disabled", false);
          await detailCar(id)
          await searchCar();
        } else {
          AlertModal({
            message: "請檢查必填欄位",
            second: 1500
          })
        }
      });
    });
    //清空長租合約model
    $('#addLong_juntion').on('hidden.bs.modal', function (e) {
      $("#Long_ContractID").val("");
    });
    //清空短租合約model  
    $('#addShort_juntion').on('hidden.bs.modal', function (e) {
      $("#Short_ContractID").val("");
    })
    // 合約刪除
    $("#pills-JunctionTable").on("click", ".btn-Junction-delete", async function (e) {
      e.stopPropagation();
      let objDel = {
        userid: USERID,
        Carinfo_id: idinfo,
        Junction_No: $(this).attr("data-carjunctionid"),
        Rent_type: $(this).parents("tr").find("td.Rent_type").attr("value")
      };
      console.log(objDel);
      if (confirm('確定刪除?')) {
        let res = await CarJunctionAPI._Delete(objDel);
        console.log(res);
        // 提醒刪除成功
        await AlertModal({
          message: res.message,
          second: 1500
        });
        if (res.success) {
          await searchJunction(idinfo);
          await detailCar(id)
          await searchCar();
        }
        else console.error(res);
      } else {
        return false;
      };
    });
    //調撥明細
    $("#pills-transform").on("click", ".btn-carTransfer-eye", function (e) {
      e.stopPropagation();
      let TransferthisID = $(this).attr("data-CarTransferid");
      console.log(TransferthisID)
      $.get("components/CarTransferDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          await detailCarTransfer(TransferthisID);//調撥明細
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
      });
    });
    //詳細欣凱資訊
    $("#WArranty_byCSS").on("click", "#CssWarrantyDetail", async function () {
      let WorkNo = $(this).attr("data-workno");
      console.log(WorkNo)
      let place = $(this).attr("data-place");
      console.log(place)
      SearchByCSSDetail(WorkNo, place);
    });
    if (cb !== null) cb();
  });

}

//賣出車籍詳細頁面載入
function CarManageinfoDetail(id, idinfo) {
  console.log(234)
  $.get("components/CarManageDetail.html", function (data) {
    console.log(data)
    $("#CarManageDetail").html($.parseHTML(data));
    $(".alertEmptyCol").remove();
    (async () => {
      console.log(256)
      await getCarManageDetail();
      console.log(257)
      await detailCar(id);
      $("#CarManageDetail #pills-tabContent input").prop("disabled", true);
      $("#CarManageDetail #pills-tabContent select").prop("disabled", true);
      $("#CarManageDetail #pills-tabContent textarea").prop("disabled", true);
      $("#CarManageDetail .add-btn").addClass("d-none")
      $(".next-btn-detail").on('click', function () {
        $('#pills-tab a[href="#pills-profile"]').tab('show')
        ChineseDatePicker(".ChineseDatepicker");
      });//下一步
      $("#btn-update-ok").addClass("d-none")
      await DetailPage._on();
    })()
    //保養子頁面
    // $("#pills-record-tab").on("click", async function () {
    //   let PT = localStorage.getItem('PT');
    //   $("#add_Warranty").removeClass("d-none")
    //   console.log(PT)
    //   // 渲染畫面
    //   if (PT == "01") {
    //     $("#W_LongContract_id").removeClass('d-none')
    //     // if ($("#warranty_LongContract_id").val() !== "" || $("#warranty_LongContract_id").val() !== null) {
    //     await getWarranty_LongContract("#warranty_LongContract_id", idinfo);
    //     // } else {
    //     //   let select = "";
    //     //   select += `<option value="0">查無長租合約</option>`;
    //     //   $("#warranty_LongContract_id").html(select);
    //     // }
    //   } else {
    //     $("#W_LongContract_id").addClass('d-none')
    //     $("#warrantyStartdate").val('')
    //     $("#warrantyEnddate").val('')
    //   };
    //   await DatePicker("#warrantyEnddate");
    //   await DatePicker("#warrantyStartdate");
    //   // 搜尋畫面
    //   let Brand = localStorage.getItem('Brand');
    //   if (Brand == 'VOLVO') {
    //     searchWarrantyByCSS(idinfo);
    //     $("#tab_byASAP").on("click", async function () {
    //       searchWarranty(idinfo);
    //     });
    //     $("#tab_byCSS").on("click", async function () {
    //       searchWarrantyByCSS(idinfo);
    //     });
    //   } else {
    //     $("#tab_byCSS").addClass('d-none')
    //     $("#WArranty_byASAP").addClass('show')
    //     $("#WArranty_byCSS").removeClass('active')
    //     $("#WArranty_byASAP").addClass('active')
    //     await searchWarranty(idinfo);
    //   };
    //   // 搜尋項目改變
    //   $("#warranty_LongContract_id").on("change", async function () {
    //     let value = $("#warranty_LongContract_id").val()
    //     let startdate = $("#warranty_LongContract_id option[value='" + value + "']").attr("data-start")
    //     let enddate = $("#warranty_LongContract_id option[value='" + value + "']").attr("data-end")
    //     $("#warrantyStartdate").val(startdate)
    //     $("#warrantyEnddate").val(enddate)
    //     await searchWarranty(idinfo);
    //   });
    //   $("#warrantyStartdate ,#warrantyEnddate").on("change", async function () {
    //     await searchWarranty(idinfo);
    //   });
    //   $("#warrantyStartdate_ByCss ,#warrantyEnddate_ByCss").on("change", async function () {
    //     await searchWarrantyByCSS(idinfo);
    //   });
    // });
    // 保養子頁面
    $("#pills-record-tab").on("click", async function () {
      $("#warranty_LongContract_id,#warrantyStartdate ,#warrantyEnddate").prop("disabled", false);
      $("#add_Warranty").removeClass("d-none")
      let PT = localStorage.getItem('PT');
      console.log(PT)
      // 渲染畫面
      if (PT == "01") {
        $("#W_LongContract_id").removeClass('d-none')
        await getWarranty_LongContract("#warranty_LongContract_id", idinfo);
      } else {
        $("#W_LongContract_id").addClass('d-none')
        $("#warrantyStartdate ,#warrantyEnddate").prop("disabled", false);
        $("#warrantyStartdate").val('')
        $("#warrantyEnddate").val('')
      };
      await DatePicker("#warrantyEnddate");
      await DatePicker("#warrantyStartdate");
      // 搜尋畫面
      let Brand = localStorage.getItem('Brand');
      if (Brand == 'VOLVO') {
        searchWarrantyByCSS(idinfo);
        $("#warrantyStartdate_ByCss ,#warrantyEnddate_ByCss").prop("disabled", false);
        $("#tab_byASAP").on("click", async function () {
          await searchWarranty(idinfo);
          // $(".btn-Warranty-delete").addClass("d-none")
        });
        $("#tab_byCSS").on("click", async function () {
          searchWarrantyByCSS(idinfo);
        });
      } else {
        $("#warrantyStartdate ,#warrantyEnddate").prop("disabled", false);
        $("#tab_byCSS").addClass('d-none')
        $("#WArranty_byASAP").addClass('show')
        $("#WArranty_byCSS").removeClass('active')
        $("#WArranty_byASAP").addClass('active')
        await searchWarranty(idinfo);
        // $(".btn-Warranty-delete").addClass("d-none");
      };
      // 搜尋項目改變
      $("#warranty_LongContract_id").on("change", async function () {
        let value = $("#warranty_LongContract_id").val()
        let startdate = $("#warranty_LongContract_id option[value='" + value + "']").attr("data-start")
        let enddate = $("#warranty_LongContract_id option[value='" + value + "']").attr("data-end")
        $("#warrantyStartdate").val(startdate)
        $("#warrantyEnddate").val(enddate)
        await searchWarranty(idinfo);
        // $(".btn-Warranty-delete").addClass("d-none")
      });
      $("#warrantyStartdate ,#warrantyEnddate").on("change", async function () {
        await searchWarranty(idinfo);
        // $(".btn-Warranty-delete").addClass("d-none")
      });
      $("#warrantyStartdate_ByCss ,#warrantyEnddate_ByCss").on("change", async function () {
        await searchWarrantyByCSS(idinfo);
      });
    });
    $("#pills-Plate-tab").on("click", async function () {
      await searchPlate(idinfo);
      $(".btn-Plate-delete").addClass("d-none")
    });
    $("#pills-transform-tab").on("click", async function () {
      await searchTransfer(idinfo);
    });
    $("#pills-Insurance-tab").on("click", async function () {
      await searchInsurance(idinfo);
      $(".btn-Insurance-delete").addClass("d-none")
    });
    $("#pills-JunctionTable-tab").on("click", async function () {
      await searchJunction(idinfo);
      $(".btn-Junction-delete").addClass("d-none")
      $("#btn_Long").addClass("d-none")
      $("#btn_Short").addClass("d-none")
    });
    $("#pills-lossadvice-tab").on("click", async function () {
      await searchLossadvice(idinfo);
      $(".btn-Lossadvice-delete").addClass("d-none")
    });
    $("#pills-Pledge-tab").on("click", async function () {
      await searchPledge(idinfo);
      $(".btn-Pledge-delete").addClass("d-none")
    });
    // 掛牌修改
    $("#pills-Plate").on("click", ".btn-Plate-edit", function (e) {
      e.stopPropagation();
      let PlatethisID = $(this).attr("data-carplateid");
      console.log(PlatethisID)
      $.get("components/CarPlateDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          $("#CarOtherDetail input").prop("disabled", true);
          $("#CarOtherDetail textarea").prop("disabled", true);
          $("#CarOtherDetail select").prop("disabled", true);
          await ChineseDatePicker(".ChineseDatePicker");//下拉日期選單
          await codeDetail('23', "#PCarPlateType");//車牌種類
          await detailCarPlate(PlatethisID);
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
          $("#btn-updataPlate-ok").addClass("d-none")
        })()
      });
    });
    // 新增維修保養頁面載入
    $("#pills-record").on("click", "#add_Warranty", async function (e) {
      e.stopPropagation();
      WarrantyAddbtn(idinfo);
      // $.get("components/CarWarrantyCreate.html", function (data) {
      //   $("#CarOtherDetail").html($.parseHTML(data));
      //   clearInputCol(false, "#CarOtherDetail .Warrantyrow"); //清空輸入欄位 
      //   $("#broker").val(sessionStorage.name); //經手人
      //   //下拉選項
      //   DatePicker("#dateStart");
      //   DatePicker("#dateEnd");
      //   TimePicker("#timeStart");
      //   TimePicker("#timeEnd");
      //   let PT = localStorage.getItem('PT');
      //   console.log(PT)
      //   let me = "";
      //   if (PT == "02") {
      //     $("#W_LongContract_id").addClass('d-none')
      //     $(".mileageFrom").removeClass('d-none')
      //     me += `<label class="input-group-text d-block w-100 required" for="mileage_start">出發里程</label>`;
      //   } else {
      //     $("#W_LongContract_id").removeClass('d-none')
      //     $(".mileageFrom").addClass('d-none')
      //     me += `<label class="input-group-text d-block w-100 required" for="mileage_start">本次進廠里程</label>`;
      //   } $('.mileagetotal').html(me);
      //   getPlate_id(idinfo, "#Warranty_CarPlate_number");
      //   //長租為記錄功能
      //   let LongContract = localStorage.getItem('LC');
      //   console.log(LongContract)
      //   $('#workType').on('change', async function () {
      //     let workType = $('#workType').val();
      //     if (workType == "1") {
      //       if (LongContract == 'null') {
      //         $("#LongContract_id").prop("disabled", false).val("");
      //       } else $("#LongContract_id").prop("disabled", false).val(LongContract);
      //     }
      //     else {
      //       $("#LongContract_id").prop("disabled", true).val("");
      //     }
      //   });
      //   OtherDetailPage._on({ selector: "#CarOtherDetail" });
      //   $('#btn-createWarranty-ok').on('click', async function () {
      //     let check_result = await WarrantycheckForm();
      //     if (check_result) {
      //       await createCarWarranty(idinfo);
      //       // let Brand = localStorage.getItem('Brand');
      //       // if (Brand == 'VOLVO') {
      //       //   await searchWarrantyByCSS(idinfo);
      //       // } else {
      //       await searchWarranty(idinfo);
      //       // };
      //       await OtherDetailPage._off({ selector: "#CarOtherDetail" });
      //     } else {
      //       AlertModal({
      //         message: "請檢查必填欄位",
      //         second: 1500
      //       })
      //     }
      //   });
      // });
    });
    // 保養修改
    $("#pills-record #WArranty_byASAP").on("click", ".btn-Warranty-edit", async function (e) {
      e.stopPropagation();
      let WarrantythisID = $(this).attr("data-cwid");
      console.log(WarrantythisID);
      $.get("components/CarWarrantyDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          await DatePicker("#dateStart");
          await DatePicker("#dateEnd");
          await TimePicker("#timeStart");
          await TimePicker("#timeEnd");
          await detailCarWarranty(WarrantythisID);
          await SerchWarrantypdf(WarrantythisID);
          $("#upadteWarranty").on("change", async function () {
            let trNote = '';
            let files = $("#upadteWarranty")[0].files;
            if (files.length > 0) {
              if (files[0].type.toLowerCase().indexOf("pdf") >= 0) {
                trNote += `<a class="m-2">${files[0].name}</a>`;
              } else {
                alert("請上傳PDF!!");
              }
            } else {
              trNote += '<a class="m-2">尚無重新上傳資料</a>';
            }
            $('#Warrantyfile').html(trNote);
          });
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
        $('#btn-updataWarranty-ok').on('click', async function () {
          let check_result = await WarrantycheckForm();
          if (check_result) {
            await updateCarWarranty(WarrantythisID);
            // let Brand = localStorage.getItem('Brand');
            // if (Brand == 'VOLVO') {
            //   await searchWarrantyByCSS(idinfo);
            // } else {
            await searchWarranty(idinfo);
            // };
            await OtherDetailPage._off({ selector: "#CarOtherDetail" });
          } else {
            AlertModal({
              message: "請檢查必填欄位",
              second: 1500
            })
          };
        });
        $('#btn-warranty-finished').off('click').on('click', async function (e) {
          e.stopPropagation();
          var obj = {
            CarWarranty_id: WarrantythisID,
            ischecked: 'Y'
          };
          console.log(obj)
          let res = await CarWarrantyAPI._UpdateCheck(obj);
          if (res.success) {
            await AlertModal({
              message: res.message,
              second: 1500
            });
          } else console.error(res);
          await $('#Check').modal('hide');
          await OtherDetailPage._off({ selector: "#CarOtherDetail" });
          await searchWarranty(idinfo);
        });
        $("#Warrantyfile").on("click", ".btn-WarrantyDelete_pdf", async function () {
          let objDel = {
            id: WarrantythisID,
            content: $(this).parents("#Warrantyfile").eq(0).find("a").attr('name'),
            isadmin: "Y",
          }
          console.log(objDel);
          if (confirm('確定刪除?')) {
            let res = await ImgAPI._delete(objDel);
            console.log(res);
            // 提醒刪除成功
            await AlertModal({
              message: res.message,
              second: 1500
            });
            if (res.success) SerchWarrantypdf(WarrantythisID);
            else console.error(res);
          } else {
            return false;
          };
        })
      });
    });
    //保養明細
    $("#pills-record #WArranty_byASAP").on("click", ".btn-CarWarranty-eye", async function (e) {
      e.stopPropagation();
      let WarrantythisID = $(this).attr("data-cwid");
      console.log(WarrantythisID);
      $.get("components/CarWarrantyDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          await detailCarWarranty(WarrantythisID);
          await SerchWarrantypdf(WarrantythisID);
          $("#warrantyitem input").prop("disabled", true);
          $("#warrantyitem textarea").prop("disabled", true);
          $("#btn-updataWarranty-ok").addClass("d-none")
          $(".btn-finish").addClass("d-none")
          $(".btn-WarrantyDelete_pdf").addClass("d-none")
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
      });
    });
    // 保養刪除
    $("#pills-record #WArranty_byASAP").on("click", ".btn-Warranty-delete", async function (e) {
      e.stopPropagation();
      let objDel = {
        userid: USERID,
        CarWarranty_id: $(this).attr("data-CWid")
      };
      console.log(objDel);
      if (confirm('確定刪除?')) {
        let res = await CarWarrantyAPI._Delete(objDel);
        console.log(res);
        // 提醒刪除成功
        await AlertModal({
          message: res.message,
          second: 1500
        });
        if (res.success) {
          // let Brand = localStorage.getItem('Brand');
          // if (Brand == 'VOLVO') {
          //   await searchWarrantyByCSS(idinfo);
          // } else {
          await searchWarranty(idinfo);
          // };
        }
        else console.error(res);
      } else {
        return false;
      };
    });
    // 保養修改
    // $("#pills-record #WArranty_byASAP").on("click", ".btn-Warranty-edit", function (e) {
    //   e.stopPropagation();
    //   let WarrantythisID = $(this).attr("data-cwid");
    //   console.log(WarrantythisID);
    //   $.get("components/CarWarrantyDetail.html", function (data) {
    //     $("#CarOtherDetail").html($.parseHTML(data));
    //     $(".alertEmptyCol").remove();
    //     (async () => {
    //       await detailCarWarranty(WarrantythisID);
    //       await SerchWarrantypdf(WarrantythisID);
    //       $("#warrantyitem input").prop("disabled", true);
    //       $("#warrantyitem textarea").prop("disabled", true);
    //       $("#btn-updataWarranty-ok").addClass("d-none")
    //       $(".btn-finish").addClass("d-none")
    //       $(".btn-WarrantyDelete_pdf").addClass("d-none")
    //       $("#reupload_Warranty").addClass("d-none")
    //       await OtherDetailPage._on({ selector: "#CarOtherDetail" });
    //     })()
    //   });
    // });
    //保養明細
    // $("#pills-record #WArranty_byASAP").on("click", ".btn-CarWarranty-eye", function (e) {
    //   e.stopPropagation();
    //   let WarrantythisID = $(this).attr("data-cwid");
    //   console.log(WarrantythisID);
    //   $.get("components/CarWarrantyDetail.html", function (data) {
    //     $("#CarOtherDetail").html($.parseHTML(data));
    //     $(".alertEmptyCol").remove();
    //     (async () => {
    //       await detailCarWarranty(WarrantythisID);
    //       await SerchWarrantypdf(WarrantythisID);
    //       $("#warrantyitem input").prop("disabled", true);
    //       $("#warrantyitem textarea").prop("disabled", true);
    //       $("#btn-updataWarranty-ok").addClass("d-none")
    //       $(".btn-finish").addClass("d-none")
    //       $(".btn-WarrantyDelete_pdf").addClass("d-none")
    //       $("#reupload_Warranty").addClass("d-none")
    //       await OtherDetailPage._on({ selector: "#CarOtherDetail" });
    //     })()
    //   });
    // });
    // 保險修改
    $("#pills-Insurance").on("click", ".btn-Insurance-edit", function (e) {
      e.stopPropagation();
      let InsurancethisID = $(this).attr("data-CarInsuranceid");
      console.log(InsurancethisID);
      $.get("components/CarInsuranceDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          $("#CarOtherDetail input").prop("disabled", true);
          $("#CarOtherDetail textarea").prop("disabled", true);
          $("#CarOtherDetail select").prop("disabled", true);
          await ChineseDatePicker(".ChineseDatePicker");//下拉日期選單
          await codeDetail('24', "#insurance_type");//險種
          await detailCarInsurance(InsurancethisID);
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
        $('#btn-updataInsurance-ok').addClass("d-none");
      })
    });
    // 出險修改
    $("#pills-lossadvice").on("click", ".btn-Lossadvice-edit", function (e) {
      e.stopPropagation();
      let LossadvicethisID = $(this).attr("data-carlossadviceid");
      console.log(LossadvicethisID);
      $.get("components/CarLossadviceDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          $("#CarOtherDetail input").prop("disabled", true);
          $("#CarOtherDetail textarea").prop("disabled", true);
          $("#CarOtherDetail select").prop("disabled", true);
          await ChineseDatePicker(".ChineseDatePicker");//下拉日期選單
          await codeDetail('31', "#LossType");//出險種類
          await DatePicker("#Accident_date");
          await detailCarLossadvice(LossadvicethisID);
          await Serchlosspdf(LossadvicethisID);
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
          $(".btn-LossDelete_pdf").addClass('d-none')
          $("#reupload").addClass('d-none')
        })()
        $('.btn-updataLossadvice-ok').addClass('d-none')
      });
    });
    // 牌登質押修改
    $("#pills-Pledge").on("click", ".btn-Pledge-edit", async function (e) {
      e.stopPropagation();
      let PledgethisID = $(this).attr("data-CPLid");
      console.log(PledgethisID);
      $.get("components/CarPledgeDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          await $("#CarOtherDetail input").prop("disabled", true);
          await $("#CarOtherDetail textarea").prop("disabled", true);
          await $("#CarOtherDetail select").prop("disabled", true);
          await DatePicker("#PledgeDate");
          await DatePicker("#PledgeBack");
          await detailCarPledge(PledgethisID);
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
        $('#btn-updataPledge-ok').addClass('d-none');
      });
    });
    //調撥明細
    $("#pills-transform").on("click", ".btn-carTransfer-eye", function (e) {
      e.stopPropagation();
      let TransferthisID = $(this).attr("data-CarTransferid");
      console.log(TransferthisID)
      $.get("components/CarTransferDetail.html", function (data) {
        $("#CarOtherDetail").html($.parseHTML(data));
        $(".alertEmptyCol").remove();
        (async () => {
          await detailCarTransfer(TransferthisID);//調撥明細
          await OtherDetailPage._on({ selector: "#CarOtherDetail" });
        })()
      });
    });
    //詳細欣凱資訊
    $("#WArranty_byCSS").on("click", "#CssWarrantyDetail", async function () {
      let WorkNo = $(this).attr("data-workno");
      console.log(WorkNo)
      let place = $(this).attr("data-place");
      console.log(place)
      SearchByCSSDetail(WorkNo, place);
    });
  });
};

async function WarrantyAddbtn(idinfo, cb = null) {
  $.get("components/CarWarrantyCreate.html", function (data) {
    $("#CarOtherDetail").html($.parseHTML(data));
    clearInputCol(false, "#CarOtherDetail .Warrantyrow"); //清空輸入欄位 
    $("#broker").val(sessionStorage.name); //經手人
    //下拉選項
    DatePicker("#dateStart");
    DatePicker("#dateEnd");
    TimePicker("#timeStart");
    TimePicker("#timeEnd");
    let PT = localStorage.getItem('PT');
    console.log(PT)
    let me = "";
    if (PT == "02") {
      $("#W_LongContract_id").addClass('d-none')
      $(".mileageFrom").removeClass('d-none')
      me += `<label class="input-group-text d-block w-100 required" for="mileage_start">出發里程</label>`;
    } else {
      $("#W_LongContract_id").removeClass('d-none')
      $(".mileageFrom").addClass('d-none')
      me += `<label class="input-group-text d-block w-100 required" for="mileage_start">本次進廠里程</label>`;
    } $('.mileagetotal').html(me);
    getPlate_id(idinfo, "#Warranty_CarPlate_number");
    //長租為記錄功能
    let LongContract = localStorage.getItem('LC');
    console.log(LongContract)
    $('#workType').on('change', async function () {
      let workType = $('#workType').val();
      if (workType == "1") {
        if (LongContract == 'null') {
          $("#LongContract_id").prop("disabled", false).val("");
        } else $("#LongContract_id").prop("disabled", false).val(LongContract);
      }
      else {
        $("#LongContract_id").prop("disabled", true).val("");
      }
    });
    OtherDetailPage._on({ selector: "#CarOtherDetail" });
    $('#btn-createWarranty-ok').on('click', async function () {
      let check_result = await WarrantycheckForm();
      if (check_result) {
        await createCarWarranty(idinfo);
        // let Brand = localStorage.getItem('Brand');
        // if (Brand == 'VOLVO') {
        //   await searchWarrantyByCSS(idinfo);
        // } else {
        await searchWarranty(idinfo);
        // };
        await OtherDetailPage._off({ selector: "#CarOtherDetail" });
      } else {
        AlertModal({
          message: "請檢查必填欄位",
          second: 1500
        })
      }
    });
    if (cb !== null) cb();
  });
}
//更新時間按鈕ellie
function btnrenewtime() {
  let date = new Date();
  let newdata = $("#specified_test_date").val();
  $("#specified_test_date").val((parseInt(date.getFullYear()) - 1911 + 1) + newdata.substring(3, 9));
}

if (nowPathnameRegExp == "renewCarManage.html") {
  setTimeout(function () {
    getCarManageDetail();
  }, 100);
}

// 油量設定
function oilsetting(action = "", usedlength = 4) {

  $(".oil_gauge_block_" + action).removeClass("used");
  for (var i = 0; i <= usedlength * 2; i++) {
    $(".oil_gauge_block_" + action + ":nth-child(" + i + ")").addClass("used");
  }

  $("body .input-group .form-control").off("click").on("click", ".oil_gauge_block_" + action, function () {
    var index = $(this).index();
    $(".oil_gauge_block_" + action).each(function () {
      var eachIndex = $(this).index();
      if (eachIndex > index) {
        $(this).removeClass("used");
      } else {
        $(this).addClass("used");
      }
    });
    var oil_used = $(".used").length;
    console.log(oil_used);
    oil_used = parseFloat(oil_used) / 2;

    $("#oil_" + action).text(oil_used);
  });

  // 油量"0"
  $("label[data-datacheck='oil_gauge']").off("click").on("click", function () {
    $(".oil_gauge_block_" + action).removeClass("used");
    $("#oil_" + action).text("0");
  });

}
// 表單規則
async function getCarManageDetail() {
  $("#broker").val(sessionStorage.name); //經手人
  $(".currentDate").text(CurrentDay()); //建立日期
  //下拉選單的年月設定
  $.ms_DatePicker({
    YearSelector: ".sel_year",
    MonthSelector: ".sel_month",
  });
  codeDetailRadio("00", ".fuel", "");
  codeDetailRadio('03', ".rent_status", "");
  // ===請選擇====
  codeDetail('04', "#car_species"); //car車種
  codeDetail('21', "#Department");//車籍所屬部門
  codeDetail('22', "#PositionDetail");//車籍所屬部門
  codeDetail('25', "#rent_status");//租車狀態
  codeDetail('25', "#RentStatus");//租車狀態
  codeDetail('29', "#Station");//租車站點
  oilsetting("car");
  await $('#Department').on('change', async function () {
    let cdc_id = $('#Department').val();
    let objselect = { cc_id: '21', cdc_id: cdc_id, };
    let res = await CarselectAPI._getPositionMenu(objselect);
    await getPositionMenu(res.data, "#Department", "#Position");
    await $("#rent_status").val('');
    await $("#rent_status").prop("disabled", true);
    await $("#rent_status > option").addClass("d-none").prop("disabled", true);
    await $("#rent_status > option:first").removeClass("d-none").prop("disabled", false);
    let DepartmentSearch = $(this).val();
    if (DepartmentSearch == '02') {
      $("#rent_status").prop("disabled", false);
      $("#rent_status > option[value^='2']").removeClass("d-none").prop("disabled", false);
    } else if (DepartmentSearch == '01') {
      $("#rent_status").prop("disabled", false);
      $("#rent_status > option[value^='1']").removeClass("d-none").prop("disabled", false);
    };
  });
  //部門下拉規則
  $('#Department').on('change', function () {
    let DepartmentCreate = $(this).val();
    if (DepartmentCreate == '02') {
      $("#shortrent").removeClass('d-none');
      $("#longrent").addClass('d-none');
      $(".LongContract_id").addClass('d-none');
      $(".ShortContract_id").removeClass('d-none');
      $("#longrent input").val('');
      $('#LongContract_id').selectpicker('val', '');
    } else {
      $("#shortrent").addClass('d-none');
      $("#longrent").removeClass('d-none');
      $(".LongContract_id").removeClass('d-none');
      $(".ShortContract_id").addClass('d-none');
      $("#shortrent input").val('');
      $("#shortrent select").val('');
      $('#ShortContract_id').selectpicker('val', '');
    };
  });
}
//車籍表單判斷
async function checkForm() {
  let isdone = true;
  $(".alertEmptyCol").remove();
  if ($('#VIN').val().length == 0) {
    isdone = false;
    $('#VIN').after(createAlertEmptyCol('請輸入車身號碼!'));
  } else if ($('#Brand').val().length == 0) {
    isdone = false;
    $('#Brand').after(createAlertEmptyCol('請輸入廠牌!'));
  } else if ($('#CarColorCodeDescription').val().length == 0) {
    isdone = false;
    $('#CarColorCodeDescription').after(createAlertEmptyCol('請輸入車色!'));
  } else if ($('#buy_Price').val().length == 0) {
    isdone = false;
    $('#buy_Price').after(createAlertEmptyCol('請輸入購入金額!'));
  } else if ($('#buy_date').val().length == 0) {
    isdone = false;
    $('#buy_date').after(createAlertEmptyCol('請輸入日期!'));
  } else if ($('.Department').val().length == 0) {
    isdone = false;
    $('.Department').after(createAlertEmptyCol('請輸入車籍所屬部門!'));
  } else if ($('.Position').val().length == 0) {
    isdone = false;
    $('.Position').after(createAlertEmptyCol('請輸入車籍所在據點!'));
  } else if ($('.Station').val().length == 0) {
    isdone = false;
    $('.Station').after(createAlertEmptyCol('請輸入車輛所在位置!'));
  };
  return isdone;
};
//===================== 新增車籍 =====================
async function createCar() {
  let year = $("#CarbirthYear").val();
  let month = $("#CarbirthMonth").val();
  if (month.length <= 1) {
    month = "0" + month;
  }
  let leaveDate = year + month;
  let engine_displacement = $("#engine_displacement").val().trim();
  engine_displacement = (engine_displacement == "" ? "0" : engine_displacement);
  let oil_gauge = parseFloat($("#oil_car").text()) * 2
  oil_gauge = (oil_gauge == "" ? "0" : oil_gauge);
  let mile_fee = $("#mile_fee").val().trim();
  mile_fee = (mile_fee == "" ? "0" : mile_fee);
  let overtime_fee = $("#overtime_fee").val().trim();
  overtime_fee = (overtime_fee == "" ? "0" : overtime_fee);
  let price = $("#price").val().trim();
  price = (price == "" ? "0" : price);
  let carrier = $("#carrier").val().trim();
  carrier = (carrier == "" ? "0" : carrier);
  let milage = $("#milage").val().trim();
  milage = (milage == "" ? "0" : milage);
  let List_price = $("#List_price").val().trim();
  List_price = (List_price == "" ? "0" : List_price);
  let Discount = $("#Discount").val().trim();
  Discount = (Discount == "" ? "0" : Discount);
  let Subsidy = $("#Subsidy").val().trim()
  Subsidy = (Subsidy == "" ? "0" : Subsidy);
  let Acquisition_cost = $("#Acquisition_cost").val().trim()
  Acquisition_cost = (Acquisition_cost == "" ? "0" : Acquisition_cost);
  let Tires_strip = $("#Tires_strip").val().trim();
  Tires_strip = (Tires_strip == "" ? "0" : Tires_strip);
  let Warranty_times = $("#Warranty_times").val().trim();
  Warranty_times = (Warranty_times == "" ? "0" : Warranty_times);
  // let Warranty_year = $("#Warranty_year").val().trim();
  // Warranty_year = (Warranty_year == "" ? "0" : Warranty_year);
  let Warranty_km = $("#Warranty_km").val().trim();
  Warranty_km = (Warranty_km == "" ? "0" : Warranty_km);
  let buy_Price = $("#buy_Price").val().trim();
  buy_Price = (buy_Price == "" ? "0" : buy_Price);
  let Warranty_mile = $("#Warranty_mile").val().trim();
  Warranty_mile = (Warranty_mile == "" ? "0" : Warranty_mile);

  let obj = {
    FO: $("#FO").val(),//FO
    VIN: $("#VIN").val(),//VIN
    LicensePlateNumber: $("#LicensePlateNumber").val(),//車牌號碼
    EngineNumber: $("#EngineNumber").val(),//引擎號碼
    Brand: $("#Brand").val(),//廠牌
    CarModelCodeDescription: $("#CarModelCodeDescription").val(),//車型規格
    CarColorCodeDescription: $("#CarColorCodeDescription").val(),//車色
    Department: $("#Department").val(), //所屬部門
    Position: $("#Position").val(),//所在據點
    Station: $("#Station").val(),//所在位置
    engine_displacement: engine_displacement, //排氣量
    leave_date: leaveDate, //出廠日
    Licensing_date: getDate_toWestYear2($("#Licensing_date").val()),//領牌日
    valid_date: getDate_toWestYear2($("#valid_date").val()),//有效日期
    Expiration_date: getDate_toWestYear2($("#Expiration_date").val()),//認證日期
    car_species: $('#car_species').val(), // 車種類
    fuel: $("input[name*=fuel]:checked").val(), //使用燃料
    milage: milage, //里程數
    oil_gauge: oil_gauge, //油量
    price: price, //定價
    overtime_fee: overtime_fee, //逾時費
    mile_fee: mile_fee, //逾里程費
    carrier: carrier,//載運人數
    rent_status: $("#rent_status").val() == null ? '' : $("#rent_status").val(), //租賃狀態
    List_price: List_price, //牌價 
    Discount: Discount,//折價
    Subsidy: Subsidy,//補助款
    Acquisition_cost: Acquisition_cost,//取得成本
    specified_test_date: getDate_toWestYear2($("#specified_test_date").val()),
    pass_test_date: getDate_toWestYear2($("#pass_test_date").val()),
    ContractID: $('#LongContract_id').val(), // 合約長租編號
    contract_id: $('#ShortContract_id').val(), // 合約短租編號
    Tires_strip: Tires_strip,
    Warranty_times: Warranty_times,
    Warranty_year: getDate_toWestYear2($("#Warranty_year").val()),//保養到期日
    Warranty_km: Warranty_km,
    CarStock_remark: $('#CarStock_remark').val(),
    buy_Company: $('#buy_Company').val(),
    buy_Price: buy_Price,
    buy_remark: $('#buy_remark').val(),
    buy_date: $('#buy_date').val().replace(/-/g, ''),
    Warranty_date: getDate_toWestYear2($("#Warranty_date").val()),
    Warranty_mile: Warranty_mile,
    Tires_model: $('#Tires_model').val(),
    CarPlateType: $('#CarPlateType').val(),
  };
  console.log(obj)
  let res = await CarManageAPI._Create(obj);
  // await AlertModal({
  //   message: res.message,
  //   second: 1800
  // });
  if (res.success) {
    // 關閉modal
    await DetailPage._off();
    await AlertModal({
      message: res.message,
      second: 1800
    });
    // 查詢車籍
    searchCar();
  } else alert(res.message);
  // console.error(res);
}

//===================== 查詢車籍 =====================
async function searchCar(pg_num = 1) {
  let StatusSearch = $("select[id='StatusSearch']").val();
  console.log(StatusSearch)
  let car_licenseSearch = $('#car_licenseSearch').val();
  if (car_licenseSearch.indexOf('，') > -1) {
    alert_modal("請輸入半形逗號");
  } else {
    car_licenseSearch
  }
  var objSearch = {
    Department: $('#DepartmentSearch > option:selected').val(),
    Position: $('#PositionSearch').val(),
    LicensePlateNumber: car_licenseSearch,
    rent_status: $('#rent_statusSearch > option:selected').val(),
    Brand: $('#BrandSearch').val() == "VOLVO" ? 'YV1' : $('#BrandSearch').val(),
    Status: StatusSearch,
    CarModelCodeDescription: $('#CarModelCodeDescriptionSearch').val(),
    CarColorCodeDescription: $('#CarColorCodeDescriptionSearch').val(),
    car_species: $('#car_speciesSearch').val(),
    VIN: $('#VINSearch').val(),
    IsPledge: $('#IsPledgeSearch').val(),
    Selector: $('#SelectorSearch').val(),
    StartDate: $('#StartDateSearch').val().replace(/-/g, ''),
    EndDate: $('#EndDateSearch').val().replace(/-/g, ''),
    page: pg_num
  }
  console.log(objSearch)
  let res = await CarManageAPI._Search(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let trAdd = '';
    let newhead = '';
    let newcount = '';
    let Status = "";
    if (data.data.length > 0) {
      console.log(data.count)
      for (i in data.data) {
        switch (data.data[i].Status) {
          case '0':
            Status = '調撥中';
            break;
          case '1':
            Status = '已入庫';
            break;
          case '2':
            Status = '已賣出';
            break;
          case '3':
            Status = '新購入';
            break;
          default:
            console.log('無此事件代碼');
            Status = '';
        };
        if (i == 0) {
          newcount += `
            <div class="col-md-2 col-12 mb-2">
              <button id="btn_Transfer" type="button" class="btn col-12 text-white btn-primary" href="#"
                data-toggle="modal" data-target="#Transfer">
                <i class="fas fa-angle-double-right"></i>車輛調撥
              </button>
            </div>
            <div class="col-md-2 col-12 mb-2">
              <button id="btn_Sale" type="button" class="btn col-12 text-white btn-primary" href="#"
                data-toggle="modal" data-target="#Sale">
                <i class="fas fa-angle-double-right"></i>車輛賣出
              </button>
            </div>
            <div class="col-md-8 col-12 mb-2 text-right">
               <span>總共 ${data.count} 筆</span>
               <button id="btn-ticket" type="button" class="btn text-white btn-primary" href="#"
                data-toggle="modal" data-target="#Ticket">
                  <i class="fa fa-fw fa-car"></i>
               </button>
               <button id="btn-export" type="button" class="btn text-white btn-primary" href="#"
                data-toggle="modal">
                  <i class="fa fa-fw fa-download"></i>
               </button>
            </div>
            </div>
            
          `;
          newhead += `
         <tr class="text-left">
         <th scope="col" class="text-center" >車牌號碼</th>
         <th scope="col" class="" >所屬部門</th>
         <th scope="col" class="">所在據點</th>
                <th scope="col" class="" >廠牌車型規格</th>
                <th scope="col" class="" >車色</th>
                <th scope="col" class="" >車籍狀態</th>
                <th scope="col" class="" >客戶名稱</th>
                <th scope="col" class="" >功能</th>
        </tr>
        `
            ;
        }
        trAdd +=
          `<tr class="text-left">
          <td class="table-fixed-left text-center h4" style="font-weight:bold;">
            ${data.data[i].Status === '1' || data.data[i].Status === '3' ?
            `<label class="custom-control custom-checkbox point">
            <input type="checkbox" class="custom-control-input" name="checkedNormal" value="${data.data[i].Carinfo_id}">
              <span class="custom-control-label"><div class="ellipsis" title="${data.data[i].LicensePlateNumber}">${data.data[i].LicensePlateNumber}</div></span>
            </label>`:
            `<span><div class="ellipsis" title="${data.data[i].LicensePlateNumber}">${data.data[i].LicensePlateNumber}</div></span>`}
          </td>
          <td>${data.data[i].D}</td>
          <td>${data.data[i].P}</td>
          <td>${data.data[i].Brand}&emsp;${data.data[i].CarModelCodeDescription}</td>
          <td>${data.data[i].CarColorCodeDescription}</td>
          <td>${Status}</td>
          <td>${data.data[i].Department === '02' ? `${data.data[i].S_Customer_name == null ? `` : `${data.data[i].S_Customer_id == null ? `` : `<a href="javascript:window.open('/back/CustomerManage.html?SCID=${data.data[i].S_Customer_id}')">${data.data[i].L_Customer_name}</a>`}`}` : `${data.data[i].L_Customer_name == null ? `` : `${data.data[i].L_Customer_id == null ? `` : `<a href="javascript:window.open('/back/CustomerManage.html?SCID=${data.data[i].L_Customer_id}')">${data.data[i].L_Customer_name}</a>`}`}`}</td>
          <td>
          ${data.data[i].Status === '1' || data.data[i].Status === '3' ?
            `<a class="btn ml-1 btn-edit" data-carid="${data.data[i].No}" href="#" data-carinfo="${data.data[i].Carinfo_id}"data-toggle="modal" data-target="" type="button">
              <i class="fas fas fa-edit text-white"></i>
              </a>
              ${data.data[i].Brand === 'VOLVO' ? `` : `<a class="btn ml-1 btn-delete" data-carid="${data.data[i].No}" href="#" data-toggle="modal" data-target="" type="button">
              <i class="fas fa-trash text-white"></i>
              </a>`}` : ``}
            ${data.data[i].Status === '2' ? `<a class="btn ml-1 btn-eye btn-primary" data-carid="${data.data[i].No}" href="#" data-carinfo="${data.data[i].Carinfo_id}"data-toggle="modal" data-target="" type="button">
              <i class="fas fas fa-eye text-white"></i>
              </a>`: ``}
          </td>
          </tr>`;
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('.carManagehead').html(newhead);
    $('.carManageGroup').html(trAdd);
    $('#btncount').html(newcount);
    // 產生分頁按鈕
    $("#pageNav").html(createPageNav(data.pagecount, "Car", pg_num));
    //滑動table至頂
    $('#contain').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
}

//===================== 產生車籍明細 =====================
async function detailCar(thisID) {
  var objDetail = {
    No: thisID,
  };
  let res = await CarManageAPI._Detail(objDetail);
  let data = res.data.data;
  console.log(data)
  if (res.success) {
    //取得資料並塞到對應的欄位
    for (var a in data[0]) {
      var obj = String(data[0][a]);
      $("#" + a).val(obj);
    }

    $("#RentStatus").val(data[0].rent_status)
    console.log(data[0].rent_status)
    $("#oil_car").text(data[0].oil_gauge / 2);
    oilsetting("car", parseFloat(data[0].oil_gauge / 2));
    $(":radio[name='fuel']").prop("checked", false);
    $("#fuel" + data[0].fuel).prop("checked", true);
    $("#Department > option[value='" + data[0].Department + "']").prop("selected", true)
    $("#PositionDetail > option[value='" + data[0].Position + "']").prop("selected", true)

    $("#CarPlateTypeDetail").val(data[0].CarPlateType)
    $("#rent_status").val(data[0].rent_status)

    data[0].Licensing_date === null || data[0].Licensing_date === '' ? $("#Licensing_date").val("") : $("#Licensing_date").val(getDate_toRepublic(data[0].Licensing_date));
    data[0].Warranty_date === null || data[0].Warranty_date === '' ? $("#Warranty_date").val("") : $("#Warranty_date").val(getDate_toRepublic(data[0].Warranty_date));
    data[0].valid_date == null || data[0].valid_date == '' ? $("#valid_date").val("") : $("#valid_date").val(getDate_toRepublic(data[0].valid_date));
    data[0].Expiration_date == null || data[0].Expiration_date == '' ? $("#Expiration_date").val("") : $("#Expiration_date").val(getDate_toRepublic(data[0].Expiration_date));
    data[0].specified_test_date == null || data[0].specified_test_date == '' ? $("#specified_test_date").val("") : $("#specified_test_date").val(getDate_toRepublic(data[0].specified_test_date));
    data[0].pass_test_date == null || data[0].pass_test_date == '' ? $("#pass_test_date").val("") : $("#pass_test_date").val(getDate_toRepublic(data[0].pass_test_date));
    data[0].Warranty_year == null || data[0].Warranty_year == '' ? $("#Warranty_year").val("") : $("#Warranty_year").val(getDate_toRepublic(data[0].Warranty_year));
    data[0].buy_date === null || data[0].buy_date === "" ? "" : $("#buy_date").val(dateFormatSendBack(data[0].buy_date, 8))
    data[0].Status != '0' ? data[0].Status != '1' ? data[0].Status != '2' ? $("#Status").val('新購入') : $("#Status").val('已賣出') : $("#Status").val('已入庫') : $("#Status").val('調撥中')
    data[0].Department == '01' ? $("#Customer_id").val(data[0].L_Customer_name) : data[0].Department == '02' ? $("#Customer_id").val(data[0].S_Customer_name) : "";
    data[0].Department == '01' ? $("#Contract_id").val(data[0].ContractID) : data[0].Department == '02' ? $("#Contract_id").val(data[0].contract_id) : "";
    data[0].cre_time === null || data[0].cre_time === "" ? "" : $("#cre_time").val(dateFormatSendBack(data[0].cre_time, 14))
    data[0].upd_time === null || data[0].upd_time === "" ? "" : $("#upd_time").val(dateFormatSendBack(data[0].upd_time, 14))
    data[0].maintananceFee > '5000' ? $("#IsWarranty").val('是') : $("#IsWarranty").val('否')
    data[0].rentType == '0' ? $("#L_RentType").val('純租') : data[0].rentType == '1' ? $("#L_RentType").val('汰舊') : ""
    $("#SalesID").val(data[0].Account_name)
    //新增btn功能ellie
    if (data[0].renewtime_alarm === "Y") {
      changeBtnState('.btn-renewtime', false);
    } else {
      changeBtnState('.btn-renewtime', true);

    }
    console.log(data)
    if (data[0].leave_date != null && data[0].leave_date != "") {
      var year = data[0].leave_date.substring(0, 4);
      var month = data[0].leave_date.substring(4, 6);
    }

    $("#CarbirthYear > option[value='" + year + "']").prop("selected", true)
    if (year != null && year != "") {
      //判斷月份的位數 03 --> 3
      if (month.substring(0, 1) == 0) {
        month = month.substring(1);
        $("#CarbirthMonth").val(month);
      } else {
        $("#CarbirthMonth").val(month);
      }
    }
    $("#look_leave_date").val(data[0].leave_date)
    data[0].Licensing_date === null || data[0].Licensing_date === '' ? $("#look_ListingDate").val("") : $("#look_ListingDate").val(getDate_toRepublic(data[0].Licensing_date));

    data[0].InsuranceRentPeriodStartExpectedDate === null || data[0].
      InsuranceRentPeriodStartExpectedDate === '' ? $("#RentStar").val("") : $("#RentStar").val(data[0].InsuranceRentPeriodStartExpectedDate.substr(0, 10));

    data[0].InsuranceRentPeriodEndExpectedDate === null || data[0].InsuranceRentPeriodEndExpectedDate === '' ? $("#RentEnd").val("") : $("#RentEnd").val(data[0].InsuranceRentPeriodEndExpectedDate.substr(0, 10));

    localStorage.setItem('LP', $("#LicensePlateNumber").val());
    localStorage.setItem('VIN', $("#VIN").val());
    localStorage.setItem('LC', data[0].ContractID);
    localStorage.setItem('SC', data[0].contract_id);
    localStorage.setItem('Brand', $("#Brand").val());
    localStorage.setItem('PT', $("#Department").val());
  } else {
    if (nowPathnameRegExp == "ContractManage.html" && $("#LicensePlateNumber").val() != "") {
      alert_modal("沒有這台車");
    }
  }
}
//===================== 更新車籍單 =====================
async function updateCar(thisID) {
  let year = $("#CarbirthYear").val();
  let month = $("#CarbirthMonth").val();
  if (month.length <= 1) {
    month = "0" + month;
  }
  let leaveDate = year + month;
  let engine_displacement = $("#engine_displacement").val().trim();
  engine_displacement = (engine_displacement == "" ? "0" : engine_displacement);
  let oil_gauge = parseFloat($("#oil_car").text()) * 2
  oil_gauge = (oil_gauge == "" ? "0" : oil_gauge);
  let mile_fee = $("#mile_fee").val().trim();
  mile_fee = (mile_fee == "" ? "0" : mile_fee);
  let overtime_fee = $("#overtime_fee").val().trim();
  overtime_fee = (overtime_fee == "" ? "0" : overtime_fee);
  let price = $("#price").val().trim();
  price = (price == "" ? "0" : price);
  let carrier = $("#carrier").val().trim();
  carrier = (carrier == "" ? "0" : carrier);
  let milage = $("#milage").val().trim();
  milage = (milage == "" ? "0" : milage);
  let List_price = $("#List_price").val().trim();
  List_price = (List_price == "" ? "0" : List_price);
  let Discount = $("#Discount").val().trim();
  Discount = (Discount == "" ? "0" : Discount);
  let Subsidy = $("#Subsidy").val().trim()
  Subsidy = (Subsidy == "" ? "0" : Subsidy);
  let Acquisition_cost = $("#Acquisition_cost").val().trim()
  Acquisition_cost = (Acquisition_cost == "" ? "0" : Acquisition_cost);

  let Tires_strip = $("#Tires_strip").val().trim();
  Tires_strip = (Tires_strip == "" ? "0" : Tires_strip);
  let Warranty_times = $("#Warranty_times").val().trim();
  Warranty_times = (Warranty_times == "" ? "0" : Warranty_times);
  // let Warranty_year = $("#Warranty_year").val().trim();
  // Warranty_year = (Warranty_year == "" ? "0" : Warranty_year);
  let Warranty_km = $("#Warranty_km").val().trim();
  Warranty_km = (Warranty_km == "" ? "0" : Warranty_km);
  let buy_Price = $("#buy_Price").val().trim();
  buy_Price = (buy_Price == "" ? "0" : buy_Price);
  let Warranty_mile = $("#Warranty_mile").val().trim();
  Warranty_mile = (Warranty_mile == "" ? "0" : Warranty_mile);

  let objupdate = {
    No: thisID,
    FO: $("#FO").val(),//FO
    VIN: $("#VIN").val(),//VIN
    LicensePlateNumber: $("#LicensePlateNumber").val(),//車牌號碼
    EngineNumber: $("#EngineNumber").val(),//引擎號碼
    Brand: $("#Brand").val(),//廠牌
    CarModelCodeDescription: $("#CarModelCodeDescription").val(),//車型規格
    CarColorCodeDescription: $("#CarColorCodeDescription").val(),//車色
    Station: $("#Station").val(),//所在據點
    engine_displacement: engine_displacement, //排氣量
    leave_date: leaveDate, //出廠日
    car_species: $('#car_species').val(), // 車種類
    fuel: $("input[name*=fuel]:checked").val(), //使用燃料
    milage: milage, //里程數
    oil_gauge: oil_gauge, //油量
    price: price, //定價
    overtime_fee: overtime_fee, //逾時費
    mile_fee: mile_fee, //逾里程費
    carrier: carrier,//載運人數
    rent_status: $('#rent_status').val(),
    List_price: List_price, //牌價 
    Discount: Discount,//折價
    Subsidy: Subsidy,//補助款
    Acquisition_cost: Acquisition_cost,//取得成本
    specified_test_date: getDate_toWestYear2($("#specified_test_date").val()),
    pass_test_date: getDate_toWestYear2($("#pass_test_date").val()),
    Tires_strip: Tires_strip,
    Warranty_times: Warranty_times,
    Warranty_year: getDate_toWestYear2($("#Warranty_year").val()),
    Warranty_km: Warranty_km,
    CarStock_remark: $('#CarStock_remark').val(),
    buy_Company: $('#buy_Company').val(),
    buy_Price: buy_Price,
    buy_remark: $('#buy_remark').val(),
    buy_date: $('#buy_date').val().replace(/-/g, ''),
    Warranty_mile: Warranty_mile,
    Tires_model: $('#Tires_model').val(),
    Warranty_date: getDate_toWestYear2($("#Warranty_date").val()),
  };
  console.log(objupdate)
  let res = await CarManageAPI._Update(objupdate);
  console.log(res)
  await AlertModal({
    message: res.message,
    second: 1500
  });
  if (res.success) {
    // 查詢車籍
    searchCar();
    // 關閉modal
    await DetailPage._off();
  } else console.error(res);
}

//===================== 新增保修star =====================//
//新增保修
async function createCarWarranty(thisinfoID) {
  let data = new FormData();
  let files = $("#Warrantyfile")[0].files;
  if (files.length > 0) {
    if (files[0].type.toLowerCase().indexOf("pdf") >= 0) {
      data.append(files[0].name, files[0]);
    } else {
      alert("請上傳PDF!!");
    }
  }
  let obj = new createWarranty({
    Carinfo_id: thisinfoID,
    CarPlate_number: $("#Warranty_CarPlate_number").val(),
    ContractID: $("#LongContract_id").val(),
    place: $("#place").val().trim(),
    mileage_start: $("#mileage_start").val() == "" ? "0" : $("#mileage_start").val(),
    mileage_end: $("#mileage_end").val() == "" ? "0" : $("#mileage_end").val(),
    item: $("#item").val().trim(),
    date_start: dateRegex($("#dateStart").val(), $("#timeStart").val()),
    date_end: dateRegex($("#dateEnd").val(), $("#timeEnd").val()),
    selfprice: $("#selfprice").val().trim() == "" ? "0" : $("#selfprice").val().trim(),
    price: $("#Wprice").val().trim() == "" ? "0" : $("#Wprice").val().trim(),
    broker: $("#broker").val(),
    Insurance_remark: $("#Insurance_remark").val(),
    workType: $("#workType").val(),
    ischecked: "N"
  });
  console.log(obj)
  data.append("jsonData", JSON.stringify(obj));
  let res = await CarWarrantyAPI._Create({ data: data });
  await AlertModal({
    message: res.message,
    second: 1500
  });
}

//搜尋保修BYCSS
async function searchWarrantyByCSS(thisinfoID) {
  var objSearch = {
    Carinfo_id: thisinfoID,
    date_start: $("#warrantyStartdate_ByCss").val().replace(/-/g, ''),
    date_end: $("#warrantyEnddate_ByCss").val().replace(/-/g, '')
  }
  console.log(objSearch)
  let res = await CarWarrantyAPI._SearchByCSS(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let trAdd = '';
    if (data.length > 0) {
      for (let i in data) {
        // switch (data[i].WorkType) {
        //   case '0':
        //     WorkType = '維修';
        //     break;
        //   case '1':
        //     WorkType = '保養';
        //     break;
        //   case '2':
        //     WorkType = 'PDI';
        //     break;
        //   default:
        //     console.log('無此事件代碼');
        //     WorkType = '';
        // };
        trAdd +=
          `<tr class="text-center">
              <td data-th="是否結案">${data[i].Situation === 'NC' ? `<a class="text-danger">未結案</a>` : `結案`}</td>
              <td>${data[i].Lpn}</td>
              <td>${data[i].Place}</td>
              <td>${data[i].Mileage}</td>
              <td title="${data[i].Items}">${data[i].Items}</td>
              <td>${data[i].StartTime == "" ? `` : `${dateFormatSendBack(data[i].StartTime, 12)}`}</td>
              <td>${data[i].EndTime == "" ? `` : `${dateFormatSendBack(data[i].EndTime, 12)}`}</td>
              <td>${Math.round(data[i].Price * 10) / 10}</td>
              <td>${data[i].WorkType}</td>
              <td title"${data[i].Remark}">${data[i].Remark}</td>
              <td>
              <a id="CssWarrantyDetail"class="btn ml-1 btn-primary" data-WorkNo="${data[i].WorkNo}" data-place="${data[i].Place}" href="#" data-toggle="modal" data-target="#byCSSDetail">
              <i class="fas fa-eye text-white"></i></a>
              </td>
          </tr>`;
        // if (data[i].IsAsap == false) {
        //   trAdd +=
        //     `<tr class="text-center" >
        //       <td>${data[i].Situation}</td>
        //       <td>${data[i].Lpn}</td>
        //       <td>${data[i].Place}</td>
        //       <td>${data[i].Mileage}</td>
        //       <td title="${data[i].Items}">${data[i].Items}</td>
        //       <td>${data[i].StartTime == "" ? `` : `${dateFormatSendBack(data[i].StartTime, 12)}`}</td>
        //       <td>${data[i].EndTime == "" ? `` : `${dateFormatSendBack(data[i].EndTime, 12)}`}</td>
        //       <td>${Math.round(data[i].Price * 10) / 10}</td>
        //       <td>${data[i].WorkType}</td>
        //       <td title="${data[i].Remark}">${data[i].Remark}</td>

        //   </tr>`;
        // }
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('#pills-record #WArranty_byCSS .warrantyGroupByCSS').html(trAdd);
    //滑動table至頂
    $('#pills-record #WArranty_byCSS .warrantyGroupByCSS').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
};
//搜尋保修BYCSS
async function SearchByCSSDetail(WorkNo, place) {
  var objSearch = {
    WorkNo: WorkNo,
    place: place
  }
  console.log(objSearch)
  let res = await CarWarrantyAPI._SearchByCSSDetail(objSearch);
  let data = res.Data;
  console.log(res)
  if (res.Success) {
    let trAdd = '';
    if (data.length > 0) {
      for (let i in data) {
        trAdd +=
          `<tr class="text-center">
              <td>${data[i].job_no}</td>
              <td>${data[i].op_code}</td>
              <td title="${data[i].wrk_detail}">${data[i].wrk_detail}</td>
              <td>${data[i].wrk_hours}</td>
              <td>${data[i].discount}</td>
              <td>${data[i].ReserveCost}</td>
              <td>${data[i].technician}</td>
              <td>${data[i].pay_code}</td>
          </tr>`;
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('#byCSSDetail .css_detail').html(trAdd);
    //滑動table至頂
    $('#byCSSDetail .css_detail').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
};
//搜尋保修
async function searchWarranty(thisinfoID) {
  var objSearch = {
    Carinfo_id: thisinfoID,
    warrantyStartdate: $('#warrantyStartdate').val(),
    warrantyEnddate: $("#warrantyEnddate").val().replace(/-/g, '') + String(2400),
  }
  console.log(objSearch)
  let res = await CarWarrantyAPI._Search(objSearch);
  let data = res.data.data;
  console.log(res)
  if (res.success) {
    let trAdd = '';
    let workType = "";
    let count = "";
    if (data.data.length > 0) {
      for (let i in data.data) {
        if (i == 0) {
          count += `
          <span class="m-2">累積維修保養次數 : <a class="m-2 text-dark font-weight-bold">${data.count[i].count_total}</a> 次</span>
          <span>累積維修保養總額 : <a class="m-2 text-dark font-weight-bold">${data.count[i].price_total}</a> 元</span>
         `
        };
        switch (data.data[i].workType) {
          case '0':
            workType = '維修';
            break;
          case '1':
            workType = '保養';
            break;
          case '2':
            workType = 'PDI';
            break;
          default:
            console.log('無此事件代碼');
            workType = '';
        };
        trAdd +=
          `<tr class="text-center" >
              <td data-th="是否結案">${data.data[i].ischecked === 'Y' ? `結案` : `${data.data[i].ischecked.indexOf('C') > 0 ? `<a class="text-success">待確認</a>` : `<a class="text-danger">未結案</a>`}`}</td>
              <td>${data.data[i].CarPlate_number}</td>
              <td>${data.data[i].place}</td>
              <td>${data.data[i].mileage_start}</td>
              <td title="${data.data[i].item}">${data.data[i].item}</td>
              <td>${data.data[i].date_start == "" ? `` : `${dateFormatSendBack(data.data[i].date_start, 12)}`}</td>
              <td>${data.data[i].date_end == "" ? `` : `${dateFormatSendBack(data.data[i].date_end, 12)}`}</td>
              <td>${data.data[i].price}</td>
              <td>${workType}</td>
              <td title"${data.data[i].Insurance_remark}">${data.data[i].Insurance_remark}</td>
              <td class="text-right">
                <a ${data.data[i].ischecked == "Y" ? `` : `class="btn ml-1 btn-secondary btn-Warranty-edit" data-CWid="${data.data[i].CarWarranty_id}" href="#" data-toggle="" data-target="" type="button">
                <i class="fas fas fa-edit text-white"></i>
                </a>`}
                <a ${data.data[i].ischecked == "Y" ? `` : `class="btn btn-danger btn-Warranty-delete" data-CWid="${data.data[i].CarWarranty_id}" href="#" data-toggle="" data-target="" type="button">
                <i class="fas fa-trash text-white"></i>
                </a>`}
                <a ${data.data[i].ischecked != "Y" ? `` : `class="btn ml-1 btn-CarWarranty-eye btn-primary" data-CWid="${data.data[i].CarWarranty_id}" href="#" data-target="" type="button">
                <i class="fas fa-eye text-white"></i></a>`}
              </td> 
          </tr>`
          ;
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('#pills-record .warrantyGroup').html(trAdd);
    $('#pills-record #warranty_count').html(count);
    //滑動table至頂
    $('#pills-record .warrantyGroup').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
};
//保養明細
async function CarwarrantyDetail(WarrantythisID) {
  $.get("components/CarWarrantyDetail.html", function (data) {
    $("#CarOtherDetail").html($.parseHTML(data));
    $(".alertEmptyCol").remove();
    (async () => {
      await detailCarWarranty(WarrantythisID);
      await SerchWarrantypdf(WarrantythisID);
      $("#warrantyitem input").prop("disabled", true);
      $("#warrantyitem textarea").prop("disabled", true);
      $("#btn-updataWarranty-ok").addClass("d-none")
      $(".btn-finish").addClass("d-none")
      $(".btn-WarrantyDelete_pdf").addClass("d-none")
      await OtherDetailPage._on({ selector: "#CarOtherDetail" });
    })()
  });
}
//保修明細api 
async function detailCarWarranty(WarrantythisID) {
  var objDetail = {
    CarWarranty_id: WarrantythisID,
  };
  let res = await CarWarrantyAPI._Detail(objDetail);
  let data = res.data.data;
  console.log(data)
  if (res.success) {
    //取得資料並塞到對應的欄位
    for (var a in data[0]) {
      var obj = String(data[0][a]);
      $("#" + a).val(obj);
    }
    let me = "";
    if (data[0].mileage_end == 0) {
      $(".mileageFrom").addClass('d-none')
      me += `<label class="input-group-text d-block w-100 required" for="mileage_start">本次進廠里程</label>`;
    } else {
      $(".mileageFrom").removeClass('d-none')
      me += `<label class="input-group-text d-block w-100 required" for="mileage_start">出發里程</label>`;
    } $('.mileagetotal').html(me);
    $("#Wprice").val(data[0].price);
    data[0].date_start == "" ? "" : $("#dateStart").val(dateFormatSendBack(data[0].date_start, 8))
    data[0].date_end == "" ? "" : $("#dateEnd").val(dateFormatSendBack(data[0].date_end, 8));
    data[0].date_start == "" ? "" : $("#timeStart").val(dateFormatSendBack(data[0].date_start, 4));
    data[0].date_end == "" ? "" : $("#timeEnd").val(dateFormatSendBack(data[0].date_end, 4));
    $("#ischecked > option[value='" + data[0].ischecked + "']").prop("selected", true)
    $("#WLongContract_id").val(data[0].ContractID);
    data[0].workType != '0' ? data[0].workType != '1' ? data[0].workType != '2' ? "" : $("#workType").val('PDI') : $("#workType").val('保險') : $("#workType").val('維修');
  };
};
//更新保修
async function WarrantyUpdate(WarrantythisID, idinfo) {
  $.get("components/CarWarrantyDetail.html", function (data) {
    $("#CarOtherDetail").html($.parseHTML(data));
    $(".alertEmptyCol").remove();
    (async () => {
      await DatePicker("#dateStart");
      await DatePicker("#dateEnd");
      await TimePicker("#timeStart");
      await TimePicker("#timeEnd");
      await detailCarWarranty(WarrantythisID);
      await SerchWarrantypdf(WarrantythisID);
      $("#upadteWarranty").on("change", async function () {
        let trNote = '';
        let files = $("#upadteWarranty")[0].files;
        if (files.length > 0) {
          if (files[0].type.toLowerCase().indexOf("pdf") >= 0) {
            trNote += `<a class="m-2">${files[0].name}</a>`;
          } else {
            alert("請上傳PDF!!");
          }
        } else {
          trNote += '<a class="m-2">尚無重新上傳資料</a>';
        }
        $('#Warrantyfile').html(trNote);
      });
      await OtherDetailPage._on({ selector: "#CarOtherDetail" });
    })()
    $('#btn-updataWarranty-ok').on('click', async function () {
      let check_result = await WarrantycheckForm();
      if (check_result) {
        await updateCarWarranty(WarrantythisID);
        // let Brand = localStorage.getItem('Brand');
        // if (Brand == 'VOLVO') {
        //   await searchWarrantyByCSS(idinfo);
        // } else {
        await searchWarranty(idinfo);
        // };
        await OtherDetailPage._off({ selector: "#CarOtherDetail" });
      } else {
        AlertModal({
          message: "請檢查必填欄位",
          second: 1500
        })
      };
    });
    $('#btn-warranty-finished').off('click').on('click', async function (e) {
      e.stopPropagation();
      var obj = {
        CarWarranty_id: WarrantythisID,
        ischecked: 'Y'
      };
      console.log(obj)
      let res = await CarWarrantyAPI._UpdateCheck(obj);
      if (res.success) {
        await AlertModal({
          message: res.message,
          second: 1500
        });
      } else console.error(res);
      await $('#Check').modal('hide');
      await OtherDetailPage._off({ selector: "#CarOtherDetail" });
      await searchWarranty(idinfo);
    });
    $("#Warrantyfile").on("click", ".btn-WarrantyDelete_pdf", async function () {
      let objDel = {
        id: WarrantythisID,
        content: $(this).parents("#Warrantyfile").eq(0).find("a").attr('name'),
        isadmin: "Y",
      }
      console.log(objDel);
      if (confirm('確定刪除?')) {
        let res = await ImgAPI._delete(objDel);
        console.log(res);
        // 提醒刪除成功
        await AlertModal({
          message: res.message,
          second: 1500
        });
        if (res.success) SerchWarrantypdf(WarrantythisID);
        else console.error(res);
      } else {
        return false;
      };
    })
  });
}
// 更新保修api
async function updateCarWarranty(WarrantythisID) {
  let data = new FormData();
  let files = $("#upadteWarranty")[0].files;
  if (files.length > 0) {
    data.append(files[0].name, files[0]);
  }
  console.log(files)
  let objupdate = new updateWarranty({
    CarWarranty_id: WarrantythisID,
    place: $("#place").val().trim(),
    mileage_start: $("#mileage_start").val() == "" ? "0" : $("#mileage_start").val(),
    mileage_end: $("#mileage_end").val() == "" ? "0" : $("#mileage_end").val(),
    item: $("#item").val().trim(),
    date_start: dateRegex($("#dateStart").val(), $("#timeStart").val()),
    date_end: dateRegex($("#dateEnd").val(), $("#timeEnd").val()),
    selfprice: $("#selfprice").val().trim() == "" ? "0" : $("#selfprice").val().trim(),
    price: $("#Wprice").val().trim() == "" ? "0" : $("#Wprice").val().trim(),
    broker: $("#broker").val(),
    Insurance_remark: $("#Insurance_remark").val(),
  });
  console.log(objupdate)
  data.append("jsonData", JSON.stringify(objupdate));
  let res = await CarWarrantyAPI._Update({ data: data })
  await AlertModal({
    message: res.message,
    second: 1500
  });
  console.log(res)
}
//===================== 新增保修end =====================//
//===================== 新增車輛掛牌 =====================//
//新增掛牌
async function createCarPlate(thisinfoID, thisID) {
  let obj = {
    CarPlate_number: $("#PCarPlate_number").val(),
    VIN: $("#PVIN").val(),
    Licensing_date: getDate_toWestYear2($("#PLicensing_date").val()),
    valid_date: getDate_toWestYear2($("#Pvalid_date").val()),
    Expiration_date: getDate_toWestYear2($("#PExpiration_date").val()),
    CarPlateType: $("#PCarPlateType").val(),
    Carinfo_id: thisinfoID,
    No: thisID,
  };
  console.log(obj)
  let res = await CarPlateAPI._Create(obj);
  await AlertModal({
    message: res.message,
    second: 1500
  });
}
//搜尋掛牌
async function searchPlate(thisinfoID) {
  var objSearch = {
    Carinfo_id: thisinfoID,
  }
  console.log(objSearch)
  let res = await CarPlateAPI._Search(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let trAdd = '';
    if (data.data.length > 0) {
      for (let i in data.data) {
        trAdd +=
          `<tr class="accountRow text-center"> 
            <td>${data.data[i].CarPlate_number}</td>
            <td>${data.data[i].VIN}</td>
            <td>${data.data[i].CarPlateType_name == null ? `` : `${data.data[i].CarPlateType_name}`}</td>
            <td>${getDate_toRepublic(data.data[i].Licensing_date)}</td>
            <td>${getDate_toRepublic(data.data[i].valid_date)}</td>
            <td>${getDate_toRepublic(data.data[i].Expiration_date)}</td>
            <td class="text-right">
            <a class="btn ml-1 btn-secondary btn-Plate-edit" data-carplateid="${data.data[i].CarPlate_id}" href="#" data-toggle="" data-target="" type="button">
            <i class="fas fas fa-edit text-white"></i>
            </a>
            <a class="btn ml-1 btn-danger btn-Plate-delete" data-carplateid="${data.data[i].CarPlate_id}" href="#" data-toggle="" data-target="" type="button">
            <i class="fas fa-trash text-white"></i>
            </a>
            </td>`;
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('#pills-Plate .PlateGroup').html(trAdd);
    //滑動table至頂
    $('#pills-Plate .PlateGroup').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
};
//掛牌明細
async function detailCarPlate(PlatethisID) {
  var objDetail = {
    CarPlate_id: PlatethisID,
  };
  let res = await CarPlateAPI._Detail(objDetail);
  let data = res.data.data;
  console.log(data)
  if (res.success) {
    //取得資料並塞到對應的欄位
    for (var a in data[0]) {
      var obj = String(data[0][a]);
      $("#P" + a).val(obj);
    }
    $("#PLicensing_date").val(getDate_toRepublic(data[0].Licensing_date));
    $("#Pvalid_date").val(getDate_toRepublic(data[0].valid_date));
    $("#PExpiration_date").val(getDate_toRepublic(data[0].Expiration_date));
    $("#PCarPlateType > option[value='" + data[0].CarPlateType + "']").prop("selected", true)
  }
}
//更新掛牌
async function updateCarPlate(PlatethisID, thisinfoID, thisID) {
  let objupdate = {
    CarPlate_id: PlatethisID,
    Carinfo_id: thisinfoID,
    No: thisID,
    valid_date: getDate_toWestYear2($("#Pvalid_date").val()),
    Expiration_date: getDate_toWestYear2($("#PExpiration_date").val()),
    Licensing_date: getDate_toWestYear2($("#PLicensing_date").val()),
    CarPlateType: $("#PCarPlateType").val(),
  };
  console.log(objupdate)
  let res = await CarPlateAPI._Update(objupdate);
  await AlertModal({
    message: res.message,
    second: 1500
  });
  console.log(res)
}
//===================== 車輛掛牌end =====================//
//===================== 新增合約star =====================//
//新增長租合約
async function createLongJunction(thisinfoID) {
  let obj = {
    Carinfo_id: thisinfoID,
    ContractID: $("#Long_ContractID").val(),
    Rent_type: "0"
  };
  console.log(obj)
  let res = await CarJunctionAPI._Create(obj);
  await AlertModal({
    message: res.message,
    second: 1500
  });
}
//新增短租合約
async function createShortJunction(thisinfoID) {
  let obj = {
    Carinfo_id: thisinfoID,
    contract_id: $("#Short_ContractID").val(),
    Rent_type: "1"
  };
  console.log(obj)
  let res = await CarJunctionAPI._Create(obj);
  await AlertModal({
    message: res.message,
    second: 1500
  });
}
//搜尋合約
async function searchJunction(thisinfoID) {
  var objSearch = {
    Carinfo_id: thisinfoID,
  }
  console.log(objSearch)
  let res = await CarJunctionAPI._Search(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let trAdd = '';
    if (data.data.length > 0) {
      for (let i in data.data) {
        trAdd +=
          `<tr class="accountRow text-center"> 
            <td>${data.data[i].CarPlate_number}</td>
            <td class ="Rent_type" value="${data.data[i].Rent_type}">${data.data[i].Rent_type == '0' ? `長租` : `短租`}</td>
            <td>${data.data[i].Rent_type == '0' ? `${data.data[i].ContractID}` : `${data.data[i].contract_id}`}</td>
            <td>${data.data[i].Rent_type == '0' ? `${data.data[i].CustomerName}` : `${data.data[i].name}`}</td>
            <td>${data.data[i].Rent_type == '0' ? `${data.data[i].InsuranceRentPeriodStartExpectedDate.substr(0, 10)}` : `${dateFormatSendBack(data.data[i].actual_take_time, 8)}`}</td>
            <td>${data.data[i].Rent_type == '0' ? `${data.data[i].InsuranceRentPeriodEndExpectedDate.substr(0, 10)}` : `${dateFormatSendBack(data.data[i].actual_return_time, 8)}`}</td>
            <td>${data.data[i].maintananceFee > '5000' ? `是` : `否`}</td>
            <td>${data.data[i].hasCourtesyCar == 'Y' ? `是(VOLVO)` : `${data.data[i].hasCourtesyCar == 'Y2' ? `是(國產車)` : `${data.data[i].hasCourtesyCar == 'N' ? `否` : ``}`}`}</td>
            <td>${data.data[i].hasCourtesyCarMaintain == 'Y' ? `是(VOLVO)` : `${data.data[i].hasCourtesyCarMaintain == 'Y2' ? `是(國產車)` : `${data.data[i].hasCourtesyCarMaintain == 'N' ? `否` : ``}`}`}</td>
            <td>${data.data[i].hasCourtesyCarTheft == 'Y' ? `是(VOLVO)` : `${data.data[i].hasCourtesyCarTheft == 'Y2' ? `是(國產車)` : `${data.data[i].hasCourtesyCarTheft == 'N' ? `否` : ``}`}`}</td>
            <td class="text-right">
            ${data.data[i].Rent_type == '0' ? `<a class="btn ml-1 btn-file btn-secondary" onclick="window.open('/back/LongApplication.html?searchId=${data.data[i].ContractID}')" target="_blank" type="button">
            <i class="fas fa-file text-white"></i></a>`: `${data.data[i].Rent_type == '1' ? `<a class="btn ml-1 btn-file btn-secondary" onclick="window.open('/back/ContractManage.html?searchId=${data.data[i].contract_id}')" target="_blank" type="button">
            <i class="fas fa-file text-white"></i></a>`: ``} `}
            <a class="btn ml-1 btn-danger btn-Junction-delete" data-carJunctionid="${data.data[i].Junction_No}" href="#" data-toggle="" data-target="" type="button">
            <i class="fas fa-trash text-white"></i>
            </a>
            </td>`;
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('#pills-JunctionTable .JunctionTableGroup').html(trAdd);
    //滑動table至頂
    $('#pills-JunctionTable .JunctionTableGroup').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
};
//===================== 車輛合約end =====================//
//===================== 車輛保險star =====================//
//新增車保
async function createCarInsurance() {
  let obj = {
    CarPlate_number: $("#Insurance_CarPlate_number").val(),
    Contract: $("#InContract").val(),
    voluntaryInsurance_stardate: getDate_toWestYear2($("#voluntaryInsurance_stardate").val()),
    voluntaryInsurance_enddate: getDate_toWestYear2($("#voluntaryInsurance_enddate").val()),
    CompulsoryInsurance_stardate: getDate_toWestYear2($("#CompulsoryInsurance_stardate").val()),
    CompulsoryInsurance_enddate: getDate_toWestYear2($("#CompulsoryInsurance_enddate").val()),
    insurance_company: $("#insurance_company").val(),
    CompulsoryInsurance_company: $("#CompulsoryInsurance_company").val(),
    insurance_type: $("#insurance_type").val(),
    insurance_original: $("#insurance_original").val().trim() == "" ? "0" : $("#insurance_original").val().trim(),
    insurance_premium: $("#insurance_premium").val().trim() == "" ? "0" : $("#insurance_premium").val().trim(),
    carinsurance_self: $("#carinsurance_self").val().trim() == "" ? "0" : $("#carinsurance_self").val().trim(),
    InsuranceRemark: $("#InsuranceRemark").val(),
    Carbody_allowance: $("#Carbody_allowance").val().trim() == "" ? "0" : $("#Carbody_allowance").val().trim(),
    StolenMoney: $("#StolenMoney").val().trim() == "" ? "0" : $("#StolenMoney").val().trim(),
  };
  console.log(obj)
  let res = await CarInsuranceAPI._Create(obj);
  await AlertModal({
    message: res.message,
    second: 1500
  });
}
//搜詢保險
async function searchInsurance(thisinfoID) {
  var objSearch = {
    Carinfo_id: thisinfoID,
  }
  console.log(objSearch)
  let res = await CarInsuranceAPI._Search(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let trAdd = '';
    if (data.data.length > 0) {
      for (let i in data.data) {
        trAdd +=
          `<tr class="accountRow text-center"> 
            <td>${data.data[i].CarPlate_number}</td>
            <td>${getDate_toRepublic(data.data[i].voluntaryInsurance_stardate)}</td>
            <td>${getDate_toRepublic(data.data[i].voluntaryInsurance_enddate)}</td>
            <td>${data.data[i].insurance_company}</td>
            <td>${getDate_toRepublic(data.data[i].CompulsoryInsurance_stardate)}</td>
            <td>${getDate_toRepublic(data.data[i].CompulsoryInsurance_enddate)}</td>
            <td>${data.data[i].CompulsoryInsurance_company}</td>
            <td>${data.data[i].insurance_type_name == null ? `` : `${data.data[i].insurance_type_name}`}</td>
            <td>${data.data[i].carinsurance_self}</td>
            <td>${data.data[i].insurance_original}</td>
            <td>${data.data[i].insurance_premium}</td>
            <td class="text-right">
            <a class="btn ml-1 btn-secondary btn-Insurance-edit" data-CarInsuranceid="${data.data[i].CarInsurance_id}" href="#" data-toggle="modal" data-target="" type="button">
            <i class="fas fas fa-edit text-white"></i>
            </a>
            <a class="btn ml-1 btn-danger btn-Insurance-delete" data-CarInsuranceid="${data.data[i].CarInsurance_id}" href="#" data-toggle="modal" data-target="" type="button">
            <i class="fas fa-trash text-white"></i>
            </a>
       </td>
            </td>`;
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('#pills-Insurance .InsuranceGroup').html(trAdd);
    //滑動table至頂
    $('#pills-Insurance .InsuranceGroup').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
};
//詳細車保
async function detailCarInsurance(InsurancethisID) {
  var objDetail = {
    CarInsurance_id: InsurancethisID,
  };
  let res = await CarInsuranceAPI._Detail(objDetail);
  let data = res.data.data;
  console.log(data)
  if (res.success) {

    //取得資料並塞到對應的欄位
    for (let a in data[0]) {
      let obj = String(data[0][a]);
      $("#" + a).val(obj);
    }
    $("#voluntaryInsurance_stardate").val(getDate_toRepublic(data[0].voluntaryInsurance_stardate));
    $("#voluntaryInsurance_enddate").val(getDate_toRepublic(data[0].voluntaryInsurance_enddate));
    $("#CompulsoryInsurance_stardate").val(getDate_toRepublic(data[0].CompulsoryInsurance_stardate));
    $("#CompulsoryInsurance_enddate").val(getDate_toRepublic(data[0].CompulsoryInsurance_enddate));
    $("#insurance_type > option[value='" + data[0].insurance_type + "']").prop("selected", true)
    $("#Rent_type > option[value='" + data[0].Rent_type + "']").prop("selected", true)
    data[0].ContractID == "" || data[0].ContractID == null ? $("#Contract").val("無合約資料") : $("#Contract").val(data[0].ContractID);
  }
}
//更新車保
async function updateCarInsurance(InsurancethisID) {
  let objupdate = {
    CarInsurance_id: InsurancethisID,
    voluntaryInsurance_stardate: getDate_toWestYear2($("#voluntaryInsurance_stardate").val()),
    voluntaryInsurance_enddate: getDate_toWestYear2($("#voluntaryInsurance_enddate").val()),
    CompulsoryInsurance_stardate: getDate_toWestYear2($("#CompulsoryInsurance_stardate").val()),
    CompulsoryInsurance_enddate: getDate_toWestYear2($("#CompulsoryInsurance_enddate").val()),
    insurance_company: $("#insurance_company").val(),
    insurance_type: $("#insurance_type").val(),
    insurance_original: $("#insurance_original").val(),
    insurance_premium: $("#insurance_premium").val(),
    CompulsoryInsurance_company: $("#CompulsoryInsurance_company").val(),
    carinsurance_self: $("#carinsurance_self").val(),
    InsuranceRemark: $("#InsuranceRemark").val(),
    Carbody_allowance: $("#Carbody_allowance").val(),
    StolenMoney: $("#StolenMoney").val(),
  };
  console.log(objupdate)
  let res = await CarInsuranceAPI._Update(objupdate);
  await AlertModal({
    message: res.message,
    second: 1500
  });
  console.log(res)
}
//===================== 車輛保險end =====================//
//===================== 車輛出險star =====================//
//新增出險
async function createCarLossadvice() {
  let data = new FormData();
  let files = $("#Lossfile")[0].files;
  if (files.length > 0) {
    if (files[0].type.toLowerCase().indexOf("pdf") >= 0) {
      data.append(files[0].name, files[0]);
    } else {
      alert("請上傳PDF!!");
    }
  }
  let obj = new createLossadvice({
    CarInsurance_id: $("#CarInsuranceID").val(),
    Contract: $("#ContractID").val(),
    Rent_type: $("#Rent_type").val(),
    Accident_date: $("#Accident_date").val().replace(/-/g, ''),
    LossType: $("#LossType").val(),
    mileage_All: $("#mileage_All").val().trim() == "" ? "0" : $("#mileage_All").val().trim(),
    LossPlace: $("#LossPlace").val(),
    LossPrice: $("#LossPrice").val() == "" ? "0" : $("#LossPrice").val(),
    LossSelfPrice: $("#LossSelfPrice").val() == "" ? "0" : $("#LossSelfPrice").val(),
    LossRatio: $("#LossRatio").val().trim() == "" ? "0" : $("#LossRatio").val().trim(),
    LossRemark: $("#LossRemark").val(),
    LossApply: $("#LossApply").val(),
    LossPlate: $("#LossPlate").val(),
    LossDate: $("#LossDate").val() == "" ? "0" : $("#LossDate").val(),
  });
  console.log(obj);
  data.append("jsonData", JSON.stringify(obj));
  // let imgObj = {
  //   id: thisinfoID,
  //   type: "10"
  // }
  // data.append("imgFile", JSON.stringify(imgObj));
  let res = await CarLossAdviceAPI._Create({ data: data });
  await AlertModal({
    message: res.message,
    second: 1500
  });
}
//搜詢出險
async function searchLossadvice(thisinfoID) {
  var objSearch = {
    Carinfo_id: thisinfoID,
  }
  console.log(objSearch)
  let res = await CarLossAdviceAPI._Search(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let trAdd = '';
    if (data.data.length > 0) {
      for (let i in data.data) {
        trAdd +=
          `<tr class="accountRow text-center"> 
            <td>${data.data[i].LongContract_id != "" || data.data[i].ShortContract_id == "" ? `${data.data[i].L_name}` : `${data.data[i].LongContract_id == "" || data.data[i].ShortContract_id != "" ? `${data.data[i].S_name}` : ``}`}</td>
            <td>${data.data[i].CarPlate_number}</td>
            <td>${data.data[i].insuranceTypename}</td>
            <td>${dateFormatSendBack(data.data[i].Accident_date)}</td>
            <td>${data.data[i].LossTypename}</td>
            <td>${data.data[i].LossPlace}</td>
            <td>${data.data[i].LossPrice}</td>
            <td class="text-right">
            <a class="btn ml-1 btn-secondary btn-Lossadvice-edit" data-CarLossadviceid="${data.data[i].CarLossAdvice_id}" href="#" data-toggle="modal" data-target="" type="button">
            <i class="fas fas fa-edit text-white"></i>
            </a>
            <a class="btn ml-1 btn-danger btn-Lossadvice-delete" data-CarLossadviceid="${data.data[i].CarLossAdvice_id}" href="#" data-toggle="modal" data-target="" type="button">
            <i class="fas fa-trash text-white"></i>
            </a>
       </td>
            </td>`;
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('#pills-lossadvice .lossadviceGroup').html(trAdd);
    //滑動table至頂
    $('#pills-lossadvice .lossadviceGroup').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
};
//詳細出險
async function detailCarLossadvice(LossadvicethisID) {
  var objDetail = {
    CarLossAdvice_id: LossadvicethisID,
  };
  let res = await CarLossAdviceAPI._Detail(objDetail);
  let data = res.data.data;
  console.log(data)
  if (res.success) {
    //取得資料並塞到對應的欄位
    for (var a in data[0]) {
      var obj = String(data[0][a]);
      $("#" + a).val(obj);
    }
    $("#LossType > option[value='" + data[0].LossType + "']").prop("selected", true)
    $("#LossApply > option[value='" + data[0].LossApply + "']").prop("selected", true)
    data[0].Accident_date == "" ? "" : $("#Accident_date").val(dateFormatSendBack(data[0].Accident_date, 8));
    $("#LACarPlate_number").val(data[0].CarPlate_number)
    $("#LAinsurance_company").val(data[0].insurance_company)
    $("#LACompulsoryInsurance_company").val(data[0].CompulsoryInsurance_company)
    $("#LAinsurance_type").val(data[0].insuranceTypename)
    data[0].LongContract_id != "" || data[0].ShortContract_id == "" ? $("#LACustomer").val(data[0].L_name) : data[0].LongContract_id == "" || data[0].ShortContract_id !== "" ? $("#LACustomer").val(data[0].S_name) : "";
    data[0].CarModelCodeDescription == "" || data[0].CarModelCodeDescription == null ? "" : $("#LACarCarModel").val(data[0].CarModelCodeDescription)
    data[0].LongContract_id != "" || data[0].ShortContract_id == "" ? $("#rentTime").val(data[0].InsuranceRentPeriodStartExpectedDate.substr(0, 10) + "~" + data[0].InsuranceRentPeriodEndExpectedDate.substr(0, 10)) : data[0].LongContract_id == "" || data[0].ShortContract_id !== "" ? $("#rentTime").val(dateFormatSendBack(data[0].actual_take_time, 8) + "~" + dateFormatSendBack(data[0].actual_return_time, 8)) : "";
    data[0].LongContract_id != "" || data[0].ShortContract_id == "" ? $("#LAContract").val(data[0].ContractID) : data[0].LongContract_id == "" || data[0].ShortContract_id !== "" ? $("#LAContract").val(data[0].contract_id) : "";
  }
}
//更新出險
async function updateCarLossadvice(LossadvicethisID) {
  let data = new FormData();
  let files = $("#upadteLOSS")[0].files;
  if (files.length > 0) {
    data.append(files[0].name, files[0]);
  }
  console.log(files)
  let objupdate = new updateLossadvice({
    CarLossAdvice_id: LossadvicethisID,
    Accident_date: $("#Accident_date").val().replace(/-/g, ''),
    LossType: $("#LossType").val(),
    mileage_All: $("#mileage_All").val().trim() == "" ? "0" : $("#mileage_All").val().trim(),
    LossPlace: $("#LossPlace").val(),
    LossPrice: $("#LossPrice").val() == "" ? "0" : $("#LossPrice").val(),
    LossSelfPrice: $("#LossSelfPrice").val() == "" ? "0" : $("#LossSelfPrice").val(),
    LossRatio: $("#LossRatio").val().trim() == "" ? "0" : $("#LossRatio").val().trim(),
    LossRemark: $("#LossRemark").val(),
    LossApply: $("#LossApply").val(),
    LossPlate: $("#LossPlate").val(),
    LossDate: $("#LossDate").val() == "" ? "0" : $("#LossDate").val(),
  });
  console.log(objupdate)
  data.append("jsonData", JSON.stringify(objupdate));
  let res = await CarLossAdviceAPI._Update({ data: data });
  await AlertModal({
    message: res.message,
    second: 1500
  });
  console.log(res)
}
//===================== 出險end =====================//
//===================== 新增牌登star =====================//
//新增牌登
async function createCarPledge() {
  let obj = {
    CarPlate_number: $("#Pledge_CarPlate_number").val(),
    IsPledge: $("#IsPledge").val(),
    PledgeBank: $("#PledgeBank").val(),
    PledgeDate: $("#PledgeDate").val().replace(/-/g, ''),
    PledgeBack: $("#PledgeBack").val().replace(/-/g, ''),
  };
  console.log(obj)
  let res = await CarPledgeAPI._Create(obj);
  await AlertModal({
    message: res.message,
    second: 1500
  });
}
//搜尋牌登
async function searchPledge(thisinfoID) {
  var objSearch = {
    Carinfo_id: thisinfoID,
  }
  console.log(objSearch)
  let res = await CarPledgeAPI._Search(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let trAdd = '';
    if (data.data.length > 0) {
      for (let i in data.data) {
        trAdd +=
          `<tr class="accountRow text-center"> 
            <td>${data.data[i].CarPlate_number}</td>
            <td>${data.data[i].IsPledge == "0" ? `是` : `${data.data[i].IsPledge == "1" ? `否` : ``}`}</td>
            <td>${data.data[i].PledgeBank}</td>
            <td>${data.data[i].PledgeDate == "" ? "" : `${dateFormatSendBack(data.data[i].PledgeDate)}`}</td>
            <td>${data.data[i].PledgeBack == "" ? "" : `${dateFormatSendBack(data.data[i].PledgeBack)}`}</td>
            <td class="text-right">
            <a class="btn ml-1 btn-secondary btn-Pledge-edit" data-CPLid="${data.data[i].CarPledge_id}" href="#" data-toggle="" data-target="" type="button">
            <i class="fas fas fa-edit text-white"></i>
            </a>
            <a class="btn ml-1 btn-danger btn-Pledge-delete" data-CPLid="${data.data[i].CarPledge_id}" href="#" data-toggle="" data-target="" type="button">
            <i class="fas fa-trash text-white"></i>
            </a>
            </td>`;
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('#pills-Pledge .PledgeGroup').html(trAdd);
    //滑動table至頂
    $('#pills-Pledge .PledgeGroup').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
};
//牌登明細
async function detailCarPledge(PledgethisID) {
  var objDetail = {
    CarPledge_id: PledgethisID,
  };
  let res = await CarPledgeAPI._Detail(objDetail);
  let data = res.data.data;
  console.log(data)
  if (res.success) {
    //取得資料並塞到對應的欄位
    for (var a in data[0]) {
      var obj = String(data[0][a]);
      $("#" + a).val(obj);
    }
    $("#IsPledge > option[value='" + data[0].IsPledge + "']").prop("selected", true)
    $("#Pledge_CarPlate_number").val(data[0].CarPlate_number)
  }
}
//更新牌登
async function updateCarPledge(PledgethisID) {
  let objupdate = {
    CarPledge_id: PledgethisID,
    IsPledge: $("#IsPledge").val(),
    PledgeBank: $("#PledgeBank").val(),
    PledgeDate: $("#PledgeDate").val().replace(/-/g, ''),
    PledgeBack: $("#PledgeBack").val().replace(/-/g, ''),
  };
  console.log(objupdate)
  let res = await CarPledgeAPI._Update(objupdate);
  await AlertModal({
    message: res.message,
    second: 1500
  });
  console.log(res)
}
//===================== 車輛牌登end =====================//
//查詢調撥
async function searchTransfer(thisinfoID) {
  var objSearch = {
    Carinfo_id: thisinfoID,
  }
  console.log(objSearch)
  let res = await CarTransferAPI._Search(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let trAdd = '';
    if (data.data.length > 0) {
      for (let i in data.data) {
        trAdd +=
          `<tr class="accountRow text-center"> 
            <td>${data.data[i].Tra_D}</td>
            <td>${data.data[i].Tra_P}</td>
            <td>${data.data[i].Tra_date == '' ? '' : dateFormatSendBack(data.data[i].Tra_date, 8)}</td>
            <td>${data.data[i].Arrive_date == '' ? '' : dateFormatSendBack(data.data[i].Arrive_date, 8)}</td> 
            <td>${data.data[i].out_remark}</td> 
            <td>${data.data[i].accept_remark}</td> 
            <td><a class="btn ml-1 btn-carTransfer-eye btn-primary" data-CarTransferid="${data.data[i].CarTransfer_id}" href="#" data-target="" type="button">
            <i class="fas fa-eye text-white"></i></a>
            </td>`;
      };
    } else {
      trAdd +=
        `<tr class="text-center">
                <th colspan="20" class="text-center">無符合條件資料</th>
             </tr>`;
    }
    $('#pills-transform .TransferGroup').html(trAdd);
    //滑動table至頂
    $('#pills-transform .TransferGroup').animate({ scrollTop: 300 }, 500);
  } else {
    await AlertModal({
      message: res.message,
      second: 0
    });
    console.error(res, res.message);
  }
};
//調撥明細
async function detailCarTransfer(TransferthisID) {
  var objDetail = {
    CarTransfer_id: TransferthisID,
  };
  let res = await CarTransferAPI._Detail(objDetail);
  console.log(res)
  let data = res.data.data;
  console.log(data)
  if (res.success) {
    console.log(data[0].Ori_D)
    // 取得資料並塞到對應的欄位
    for (var a in data[0]) {
      var obj = String(data[0][a]);
      $("#A" + a).val(obj);
    }
    $("#AOri_Department").val(data[0].Ori_D);
    $("#AOri_Position").val(data[0].Ori_D);
    $("#ATra_Department").val(data[0].Tra_D);
    $("#ATra_Position").val(data[0].Tra_P);
    data[0].Tra_date == "" ? "" : $("#ATra_date").val(dateFormatSendBack(data[0].Tra_date, 8));
    data[0].Arrive_date == "" ? "" : $("#AArrive_date").val(dateFormatSendBack(data[0].Arrive_date, 8));
  }
}

//=======================下拉選單========================//
//下拉位置
async function getPositionMenu(data, selector, secondSelector) {
  if (data.success) {
    console.log(data.data);
    let newContent = '<option value="">請選擇</option>';
    if (data.data.length !== 0 && $(selector).val() !== "") {
      for (let i in data.data) {
        newContent += ` 
        <option value="${data.data[i].cdc_id}">${data.data[i].name}</option>`;
        $(secondSelector).attr('disabled', false)
      };
    } else {
      $(secondSelector).attr('disabled', true)
    }
    console.log(newContent)
    $(secondSelector).html(newContent);
  };
};
// 查詢出險檔案
async function Serchlosspdf(LossadvicethisID) {
  let objImg = {
    type: "10",
    id: LossadvicethisID  //編號
  };
  let res = await ImgAPI._Search(objImg);
  let trNote = "";
  console.log(res);
  if (res.data.success) {
    if (res.data.data.length != 0) {
      res.data.data.forEach(element => {
        let pdfURL = element.content
        let name = pdfURL.substring(pdfURL.lastIndexOf("/") + 1);
        trNote += `
         <a class="m-2" href="${asap_img_src}/${element.content}" name="${element.content}" target="_blank">${name}</a>
         <a class="btn btn-LossDelete_pdf" href="#" data-toggle="modal" data-target="" type="button" type="button">
            <i class="fas fa-times text-danger"></i>
         </a>`
      });
      $("#reupload").addClass("d-none");
    } else if (res.data.data.length == 0) {
      trNote += `<a class="m-2">尚無上傳資料</a>`;
      $("#reupload").removeClass("d-none");
    }
    $('#Lossfile').html(trNote);
  } else {
    await AlertModal({
      message: "查詢檔案失敗",
      second: 0
    });
    console.error("查詢檔案失敗", res.data);
  }
}
// 查詢維保檔案
async function SerchWarrantypdf(WarrantythisID) {
  let objImg = {
    type: "11",
    id: WarrantythisID  //編號
  };
  let res = await ImgAPI._Search(objImg);
  let trNote = "";
  console.log(res);
  if (res.data.success) {
    if (res.data.data.length != 0) {
      res.data.data.forEach(element => {
        let pdfURL = element.content
        let name = pdfURL.substring(pdfURL.lastIndexOf("/") + 1);
        trNote += `
         <a class="m-2"href="${asap_img_src}/${element.content}" name="${element.content}"target="_blank">${name}</a>
         <a class="btn btn-WarrantyDelete_pdf" href="#" data-toggle="modal" data-target="" type="button" type="button">
            <i class="fas fa-times text-danger"></i>
         </a>`
      });
      $("#reupload_Warranty").addClass("d-none");
    } else if (res.data.data.length == 0) {
      trNote += `<a class="m-2">尚無上傳資料</a>`;
      $("#reupload_Warranty").removeClass("d-none");
    }
    $('#Warrantyfile').html(trNote);
  } else {
    await AlertModal({
      message: "查詢檔案失敗",
      second: 0
    });
    console.error("查詢檔案失敗", res.data);
  }
}
//匯出excel
async function CarinfoListExport() {
  let StatusSearch = $("select[id='StatusSearch']").val();
  await fetch_Asap_api({
    Department: $('#DepartmentSearch > option:selected').val(),
    Position: $('#PositionSearch').val(),
    VIN: $('#VINSearch').val(),
    LicensePlateNumber: $('#car_licenseSearch').val(),
    rent_status: $('#rent_statusSearch > option:selected').val(),
    Brand: $('#BrandSearch').val() == "VOLVO" ? 'YV1' : $('#BrandSearch').val(),
    Status: StatusSearch,
    CarModelCodeDescription: $('#CarModelCodeDescriptionSearch').val(),
    CarColorCodeDescription: $('#CarColorCodeDescriptionSearch').val(),
    car_species: $('#car_speciesSearch').val(),
    IsPledge: $('#IsPledgeSearch').val(),
    Selector: $('#SelectorSearch').val(),
    StartDate: $('#StartDateSearch').val().replace(/-/g, ''),
    EndDate: $('#EndDateSearch').val().replace(/-/g, ''),
  }, 'ExcelExport/CarinfoExcelExport').then(res => {
    console.log(res)
    window.location = asap_img_src + '/' + res.data.replace(/\//g, '/');
  });
}

//保養長租合約下拉選單
async function getWarranty_LongContract(selector, thisinfo) {
  var objselect = {
    Carinfo_id: thisinfo,
  }
  console.log(objselect)
  let res = await CarselectAPI._getWarranty_LongContract(objselect);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let Content = ``;
    if (data.data.length > 0) {
      for (let i in data.data) {
        if (i == 0) {
          $('#warrantyStartdate').val(data.data[0].InsuranceRentPeriodStartExpectedDate.substr(0, 10))
          $('#warrantyEnddate').val(data.data[0].InsuranceRentPeriodEndExpectedDate.substr(0, 10))
        }
        Content += `<option value="${data.data[i].ContractID}" data-start="${data.data[i].InsuranceRentPeriodStartExpectedDate.substr(0, 10)}" data-end="${data.data[i].InsuranceRentPeriodEndExpectedDate.substr(0, 10)}"">${data.data[i].ContractID} ${data.data[i].InsuranceRentPeriodStartExpectedDate.substr(0, 10)}~${data.data[i].InsuranceRentPeriodEndExpectedDate.substr(0, 10)}</option>`;
      }
    } else {
      Content += `<option value="">查無長租合約</option>`;
      $('#warrantyStartdate').val('')
      $('#warrantyEnddate').val('')
    }
    console.log(Content)
    $(selector).html(Content);
  }
};
//長租合約下拉選單
async function getLongContract(selector, Plate) {
  var objselect = {
    PlateNumber: Plate,
  }
  console.log(objselect)
  let res = await CarselectAPI._getLongContract_idMenu(objselect);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let Content = ``;
    if (data.data.length > 0) {
      for (let i in data.data) {
        Content += `<option value="${data.data[i].ContractID}">${data.data[i].ContractID}</option>`;
      }
    } else {
      Content += `<option value="">查無長租合約</option>`;
    }
    console.log(Content)
    $(selector).html(Content);
  }
};
//長租合約案件編號下拉選單
async function getLongOrder(selector, ContracID) {
  var objselect = {
    ContractID: ContracID,
  }
  //console.log(objselect)
  let res = await CarselectAPI._getLongOrder_idMenu(objselect);
  let data = res.data;
  //console.log(res)
  if (res.success) {
    let Content = ``;
    if (data.data.length > 0) {
      for (let i in data.data) {
        Content += `<option value="${data.data[i].OrderID}">${data.data[i].OrderID}</option>`;
      }
    } else {
      Content += `<option value="">查無案件編號</option>`;
    }
    //console.log(Content)
    $(selector).html(Content);
  }
};
//短租合約下拉選單
async function getShortContract(selector, Plate, IsLossAdvice) {
  var objselect = {
    car_license: Plate,
    IsLossAdvice: IsLossAdvice
  }
  let res = await CarselectAPI._getShortContract_idMenu(objselect);
  console.log(objselect)
  let data = res.data;
  console.log(res)
  if (res.success) {
    let Content = ``;
    if (data.data.length > 0) {
      for (let i in data.data) {
        Content += `<option value="${data.data[i].contract_id}">${data.data[i].contract_id}</option>`;
      };
    }
    else {
      Content += `<option value="0">查無短租合約</option>`;
    }
    console.log(Content)
    $(selector).html(Content);
  }
};
//搜尋保險
async function getInsurance_id(thisinfoID, plate, Selector, rentType) {
  var objSearch = {
    Carinfo_id: thisinfoID,
    CarPlate_number: plate,
    Rent_type: rentType,
  }
  console.log(objSearch)
  let res = await CarInsuranceAPI._Search(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let newContent = '';
    if (data.data.length > 0) {
      for (let i in data.data) {
        if (rentType == "0") {
          newContent +=
            `<option value="${data.data[i].CarInsurance_id}">${data.data[i].insurance_type_name}  ${dateFormatSendBack(data.data[i].CompulsoryInsurance_stardate, 8)}~${dateFormatSendBack(data.data[i].CompulsoryInsurance_enddate, 8)}   ${data.data[i].CompulsoryInsurance_company}</option>`;
        }
        else if (rentType == "1") {
          newContent +=
            `<option value="${data.data[i].CarInsurance_id}">${data.data[i].insurance_type_name}  ${dateFormatSendBack(data.data[i].CompulsoryInsurance_stardate, 8)}~${dateFormatSendBack(data.data[i].CompulsoryInsurance_enddate, 8)}   ${data.data[i].CompulsoryInsurance_company}</option>`;
        }
      };
    } else {
      newContent +=
        `<option value="">此車籍無保險紀錄</option>`;
    }
    console.log(newContent)
    console.log(rentType)
    $(Selector).html(newContent);
  }
};
//搜尋車牌id
async function getPlate_id(thisinfoID, Selector) {
  var objSearch = {
    Carinfo_id: thisinfoID,
  }
  console.log(objSearch)
  let res = await CarPlateAPI._Search(objSearch);
  let data = res.data;
  console.log(res)
  if (res.success) {
    let newContent = '';
    if (data.data.length > 0) {
      for (let i in data.data) {
        newContent +=
          `<option value="${data.data[i].CarPlate_number}" Pid="${data.data[i].CarPlate_id}">${data.data[i].CarPlate_number}</option>`;
      };
    } else {
      newContent +=
        `<option value="">請先建立掛牌紀錄</option>`;
    }
    console.log(newContent)
    $(Selector).html(newContent);
  }
};
//selectPICKER長租合約下拉選單
async function getLongContract_idMenu(L_Plate, L_VIN) {
  L_Plate = (L_Plate == "" ? "" : L_Plate);
  L_VIN = (L_VIN == "" ? "" : L_VIN);
  let objselect = {
    PlateNumber: L_Plate,
    VIN: L_VIN,
  };
  console.log(objselect)
  let res = await CarselectAPI._getLongContract_idMenu(objselect);
  console.log(res)
  let data = res.data;
  if (data.success) {
    console.log(data.data);
    let newContent = '<option value="">請選擇</option>';
    if (data.data.length !== 0) {
      console.log($("#CarPlate_number").val())
      for (let i in data.data) {
        newContent += ` 
        <option value="${data.data[i].ContractID}">${data.data[i].ContractID}</option>`;
        $("#LongContract_id").attr('disabled', false)
      };
    } else {
      // newContent += '<option value="">無</option>';
      $("#LongContract_id").attr('disabled', true)
    }
    console.log(newContent)
    $('#LongContract_id').html(newContent);
    $('#LongContract_id').selectpicker('refresh');
  };
};
//selectPICKER短租合約下拉選單
async function getShortContract_idMenu() {
  let objselect = {};
  let res = await CarselectAPI._getShortContract_idMenu(objselect);
  console.log(res)
  let data = res.data;
  if (data.success) {
    console.log(data.data);
    let newContent = '<option value="">請選擇</option>';
    for (let i in data.data) {
      newContent += ` 
        <option value="${data.data[i].contract_id}">${data.data[i].contract_id}</option>`;
    };
    $('#ShortContract_id').html(newContent);
    $('#ShortContract_id').selectpicker('refresh');
  };
};
//數量搜尋
// async function searchStatuscount() {
//   let objselect = {};
//   let res = await CarselectAPI._getStatuscount(objselect);
//   let data = res.data;
//   if (data.success) {
//     console.log(data.data);
//     let newContent = '';
//     for (let i in data.data) {
//       newContent += ` 
//         <div class="input-group col-md-3 col-12 pr-0 mb-2">
//                 <div class="input-group-prepend">
//                   <label class="input-group-text" for="tracar">${data.data[i].Status != '0' ? `${data.data[i].Status != '1' ? `${data.data[i].Status != '2' ? `新購入` : `已賣出`}` : `已入庫`}` : `調撥中`}</label>
//                 </div>
//                 <input id="tracar" type="text" class="form-control text-center" placeholder="${data.data[i].Status_count}" disabled>
//               </div>
//               `;
//     };
//     console.log(newContent)
//     $('#Statuscount').html(newContent);
//   };
// };
// ============================表單判斷=========================//
//掛牌表單判斷
async function PlatecheckForm() {
  let isdone = true;
  $(".alertEmptyCol").remove();
  if ($('#PVIN').val().length == 0) {
    isdone = false;
    $('#PVIN').after(createAlertEmptyCol('請輸入車身號碼!'));
  } else if ($('#PCarPlate_number').val().length == 0) {
    isdone = false;
    $('#PCarPlate_number').after(createAlertEmptyCol('請輸入車牌號碼!'));
  };
  return isdone;
};
//保險表單判斷
async function InsurancecheckForm() {
  let isdone = true;
  if ($('#insurance_type').val().length == 0) {
    isdone = false;
    $('#insurance_type').after(createAlertEmptyCol('請輸入險種!'));
  } else if ($('#InRent_type').val().length == 0) {
    isdone = false;
    $('#InRent_type').after(createAlertEmptyCol('請輸入租賃型態！'));
  } else if ($('#InContract').val().length == 0) {
    isdone = false;
    $('#InContract').after(createAlertEmptyCol('請輸入合約號碼！'));
  } else if ($('#insurance_premium').val().length == 0) {
    isdone = false;
    $('#insurance_premium').after(createAlertEmptyCol('請輸入實際保費！'));
  };
  return isdone;
};
//出險表單判斷
async function LossadvicecheckForm() {
  let isdone = true;
  if ($('#LACarPlate_number').val().length == 0) {
    isdone = false;
    $('#LACarPlate_number').after(createAlertEmptyCol('請輸入車牌號碼!'));
  } else if ($('#Rent_type').val().length == 0) {
    isdone = false;
    $('#Rent_type').after(createAlertEmptyCol('請輸入租賃型態！'));
  } else if ($('#ContractID').val().length == 0) {
    isdone = false;
    $('#ContractID').after(createAlertEmptyCol('請輸入合約號碼！'));
  } else if ($('#CarInsuranceID').val().length == 0) {
    isdone = false;
    $('#CarInsuranceID').after(createAlertEmptyCol('請輸入保險！'));
  } else if ($('#Accident_date').val().length == 0) {
    isdone = false;
    $('#Accident_date').after(createAlertEmptyCol('請輸入事故日期！'));
  } else if ($('#LossType').val().length == 0) {
    isdone = false;
    $('#LossType').after(createAlertEmptyCol('請輸入出險種類！'));
  } else if ($('#LossPlace').val().length == 0) {
    isdone = false;
    $('#LossPlace').after(createAlertEmptyCol('請輸入保養廠！'));
  } else if ($('#LossPrice').val().length == 0) {
    isdone = false;
    $('#LossPrice').after(createAlertEmptyCol('請輸入出險金額！'));
  };
  return isdone;
};
//保養表單判斷
async function WarrantycheckForm() {
  let isdone = true;
  $(".alertEmptyCol").remove();
  if ($('#place').val().length == 0) {
    isdone = false;
    $('#place').after(createAlertEmptyCol('請輸入保修廠!'));
  } else if ($('#item').val().length == 0) {
    isdone = false;
    $('#item').after(createAlertEmptyCol('請輸入修項目!'));
  } else if ($('#workType').val().length == 0) {
    isdone = false;
    $('#workType').after(createAlertEmptyCol('請輸入工單性質!'));
  } else if ($('#dateStart').val().length == 0) {
    isdone = false;
    $('#dateStart').after(createAlertEmptyCol('請輸入時間起!'));
  } else if ($('#timeStart').val().length == 0) {
    isdone = false;
    $('#timeStart').after(createAlertEmptyCol('請輸入開始時間!'));
  };
  return isdone;
};
//牌登質押表單判斷
async function PledgecheckForm() {
  let isdone = true;
  $(".alertEmptyCol").remove();
  if ($('#IsPledge').val().length == 0) {
    isdone = false;
    $('#IsPledge').after(createAlertEmptyCol('請輸入是否有牌登質押!'));
  };
  return isdone;
};
//長租合約判斷
async function L_JunctioncheckForm() {
  let isdone = true;
  $(".alertEmptyCol").remove();
  if ($('.LContract_id').val().length == 0) {
    isdone = false;
    $('.LContract_id').after(createAlertEmptyCol('請輸入長租合約編號!'));
  };
  return isdone;
};
//短租合約判斷
async function S_JunctioncheckForm() {
  let isdone = true;
  $(".alertEmptyCol").remove();
  if ($('.SContract_id').val().length == 0) {
    isdone = false;
    $('.SContract_id').after(createAlertEmptyCol('請輸入短租合約編號!'));
  };
  return isdone;
};
// ===罰單管理====
function setDefault() {
  $("#dateLast").val("071215D78");
  $("#ticketNo").val("A40465725");
  $("#plateAmt").val("AAA+6X040303000");
  $("#plateAmt").focus();
  //if (confirm("直接新增?")) {
  //    $("#plateAmt").keyup();
  //}
}
// 罰單列刪除
function removeTR(objThis) {
  $(objThis).parent().remove();

  let i = 0;
  $(".tblResult tr:not(:eq(0))").each(function () {
    i++;
    $(this).find("td").first().text(i);
  });

}
//罰單重新取值
function showTicket() {
  let tab = document.getElementById("tblTicket");
  let rows = tab.rows;
  let copy = '';
  for (let i = 1; i < rows.length; i++) {
    copy += `${rows[i].cells[0].innerHTML}\t${rows[i].cells[1].innerHTML}\t${rows[i].cells[2].innerHTML}\t${rows[i].cells[3].innerHTML}\t${rows[i].cells[4].innerHTML}\t${rows[i].cells[5].innerHTML}\t${rows[i].cells[6].innerHTML}\t${rows[i].cells[7].innerHTML}\t${rows[i].cells[8].innerHTML}\t${rows[i].cells[9].innerHTML}\t\n`;
  }
  console.log(copy);
  $("#TicketInput").val("");
  $("#TicketInput").val(copy);
}
//罰單格式確認
function checkInput() {
  let res = true;
  if ($("#dateLast").val().length != 9 || $("#dateLast").val().indexOf("D") < 0) {
    alert("條碼一格式錯誤");
    res = false;
  }
  if ($("#ticketNo").val().length != 9) {
    alert("條碼二格式錯誤");
    res = false;
  }
  if ($("#plateAmt").val().length != 15) {
    alert("條碼三格式錯誤");
    res = false;
  }

  return res;
}
//=====日期選擇器=====//
var chineseSetting = {
  _phoenixGenerateMonthYearHeader: $.datepicker._generateMonthYearHeader,

  _generateMonthYearHeader: function (inst, drawMonth, drawYear, minDate, maxDate,
    secondary, monthNames, monthNamesShort) {
    var result = $($.datepicker._phoenixGenerateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
      secondary, monthNames, monthNamesShort));
    result.children("select.ui-datepicker-year").children().each(function () {
      $(this).text('民國' + ($(this).text() - 1911) + '年');
    });
    if (inst.yearshtml) {
      var origyearshtml = inst.yearshtml;
      setTimeout(function () {
        //assure that inst.yearshtml didn't change.
        if (origyearshtml === inst.yearshtml) {
          inst.dpDiv.find('select.ui-datepicker-year:first').replaceWith(inst.yearshtml);
          inst.dpDiv.find('select.ui-datepicker-year').children().each(function () {
            $(this).text('民國' + ($(this).text() - 1911) + '年');
          });
        }
        origyearshtml = inst.yearshtml = null;
      }, 0);
    }
    //return result.html();
    return $("<div class='ui-datepicker-title'></div>").append(result.clone()).html();
  },
  _formatDate: function (inst, day, month, year) {
    if (!day) {
      inst.currentDay = inst.selectedDay;
      inst.currentMonth = inst.selectedMonth;
      inst.currentYear = inst.selectedYear;
    }
    var date = (day ? (typeof day == 'object' ? day :
      this._daylightSavingAdjust(new Date(year, month, day))) :
      this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
    return (date.getFullYear() - 1911) + "-" +
      (date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" +
      (date.getDate() <= 9 ? "0" + date.getDate() : date.getDate());
  }
};
var ENSetting = {
  _phoenixGenerateMonthYearHeader: $.datepicker._generateMonthYearHeader,
  _generateMonthYearHeader: function (inst, drawMonth, drawYear, minDate, maxDate,
    secondary, monthNames, monthNamesShort) {
    var result = $($.datepicker._phoenixGenerateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
      secondary, monthNames, monthNamesShort));
    result.children("select.ui-datepicker-year").children().each(function () {
    });
    if (inst.yearshtml) {
      var origyearshtml = inst.yearshtml;
      setTimeout(function () {
        //assure that inst.yearshtml didn't change.
        if (origyearshtml === inst.yearshtml) {
          inst.dpDiv.find('select.ui-datepicker-year:first').replaceWith(inst.yearshtml);
        }
        origyearshtml = inst.yearshtml = null;
      }, 0);
    }
    //return result.html();
    return $("<div class='ui-datepicker-title'></div>").append(result.clone()).html();
  },
  _formatDate: function (inst, day, month, year) {
    if (!day) {
      inst.currentDay = inst.selectedDay;
      inst.currentMonth = inst.selectedMonth;
      inst.currentYear = inst.selectedYear;
    }
    var date = (day ? (typeof day == 'object' ? day :
      this._daylightSavingAdjust(new Date(year, month, day))) :
      this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
    return (date.getFullYear()) + "-" +
      (date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" +
      (date.getDate() <= 9 ? "0" + date.getDate() : date.getDate());
  }
};

$(function () {
  $.datepicker.regional['zh-TW'] = {
    closeText: '關閉',
    prevText: '&#x3C;',
    nextText: '&#x3E;',
    currentText: '今天',
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ],
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    weekHeader: '周',
    dateFormat: 'yy-mm-dd',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: true
  };
  $.datepicker.setDefaults($.datepicker.regional['zh-TW']);
  ChineseDatePicker();
  DatePicker()
});