const CarManageAPI = (() => {
    /**
     * 新建車籍
     * @author Ellie
     * @param {*} id 編號
     * @param {*} cre_userid  建立者
     * @param {*} cre_time 建立時間
     * @param {*} upd_userid 更新者
     * @param {*} upd_time 更新時間
     * @param {*} carService 車籍服務種類
     * @param {*} belong 車子所在門市
     * @param {*} department 部門
     * @param {*} car_license 車號
     * @param {*} plate 車廠
     * @param {*} type 車型
     * @param {*} power 動力
     * @param {*} carFormat 車型規格備註
     * @param {*} Color 車色
     * @param {*} leave_date 出廠年月 
     * @param {*} Licensing_date 領牌日
     * @param {*} Customer_call 客戶簡稱
     * @param {*} rentType 租賃方式
     * @param {*} rentStarday 租約起租日
     * @param {*} rentEndday 租約到期日
     * @param {*} periods 期數
     * @param {*} securityMoney 保證金 
     * @param {*} monthlyrentMoney 月租金
     * @param {*} HandleSales 經辦業務
     * @param {*} UndertakeSales 承接業務
     * @param {*} remark 備註
     * @param {*} carType 車種
     * @param {*} InsuranceType 保險 
     * @param {*} engine_displacement 排氣量
     * @param {*} milage 里程數
     * @param {*} engine_number 車身號碼
     * @param {*} fuel 使用燃料
     * @param {*} position 目前所在位置
     * @param {*} rent_status 租車狀態
     * @param {*} carrier 載運人數
     * @param {*} specified_test_date 指定檢驗日期
     * @param {*} pass_test_date 檢驗合格日期
     * @param {*} overtime_fee 逾時費
     * @param {*} oil_gauge 油量
     * @param {*} price 定價
     * @param {*} mile_fee 逾里程費
     * @param {*} car_address 地址
     * @param {*} owner 車主
     * @param {*} valid_date 有效日期
     * @param {*} car_species 車種類
     * @param {*} insurance_company 保險公司
     */
    let _Create = async function ({ id, cre_userid, cre_time, upd_userid, upd_time, carService, belong, department, car_license, plate, type, power, carFormat, Color, leave_date, Licensing_date, Customer_call, rentType, rentStarday, rentEndday, periods, securityMoney, monthlyrentMoney, HandleSales, UndertakeSales, remark, carType, InsuranceType, engine_displacement, milage, engine_number, fuel, position, rent_status, carrier, specified_test_date, pass_test_date, overtime_fee, oil_gauge, price, mile_fee, car_address, owner, valid_date, car_species, insurance_company }) {
        let res = await fetch_Asap_api({
            id, cre_userid, cre_time, upd_userid, upd_time, carService, belong, department, car_license, plate, type, power, carFormat, Color, leave_date, Licensing_date, Customer_call, rentType, rentStarday, rentEndday, periods, securityMoney, monthlyrentMoney, HandleSales, UndertakeSales, remark, carType, InsuranceType, engine_displacement, milage, engine_number, fuel, position, rent_status, carrier, specified_test_date, pass_test_date, overtime_fee, oil_gauge, price, mile_fee, car_address, owner, valid_date, car_species, insurance_company
        }, "CarManage/Create");
        if (res == "Create Success") return new ResultObj({ success: true, data: res, message: "新建成功" });
        else return new ResultObj({ success: false, data: res, message: "新建失敗" });
    }
    /**
     * 更新車籍
     * @author Ellie
     * @param {*} id 編號
     * @param {*} cre_userid  建立者
     * @param {*} cre_time 建立時間
     * @param {*} upd_userid 更新者
     * @param {*} upd_time 更新時間
     * @param {*} carService 車籍服務種類
     * @param {*} belong 車子所在門市
     * @param {*} department 部門
     * @param {*} car_license 車號
     * @param {*} plate 車廠
     * @param {*} type 車型
     * @param {*} power 動力
     * @param {*} carFormat 車型規格備註
     * @param {*} Color 車色
     * @param {*} leave_date 出廠年月 
     * @param {*} Licensing_date 領牌日
     * @param {*} Customer_call 客戶簡稱
     * @param {*} rentType 租賃方式
     * @param {*} rentStarday 租約起租日
     * @param {*} rentEndday 租約到期日
     * @param {*} periods 期數
     * @param {*} securityMoney 保證金 
     * @param {*} monthlyrentMoney 月租金
     * @param {*} HandleSales 經辦業務
     * @param {*} UndertakeSales 承接業務
     * @param {*} remark 備註
     * @param {*} carType 車種
     * @param {*} InsuranceType 保險 
     * @param {*} engine_displacement 排氣量
     * @param {*} milage 里程數
     * @param {*} engine_number 車身號碼
     * @param {*} fuel 使用燃料
     * @param {*} position 目前所在位置
     * @param {*} rent_status 租車狀態
     * @param {*} carrier 載運人數
     * @param {*} specified_test_date 指定檢驗日期
     * @param {*} pass_test_date 檢驗合格日期
     * @param {*} overtime_fee 逾時費
     * @param {*} oil_gauge 油量
     * @param {*} price 定價
     * @param {*} mile_fee 逾里程費
     * @param {*} car_address 地址
     * @param {*} owner 車主
     * @param {*} valid_date 有效日期
     * @param {*} car_species 車種類
     * @param {*} insurance_company 保險公司
     */
    let _Update = async function ({ id, cre_userid, cre_time, upd_userid, upd_time, carService, belong, department, car_license, plate, type, power, carFormat, Color, leave_date, Licensing_date, Customer_call, rentType, rentStarday, rentEndday, periods, securityMoney, monthlyrentMoney, HandleSales, UndertakeSales, remark, carType, InsuranceType, engine_displacement, milage, engine_number, fuel, position, rent_status, carrier, specified_test_date, pass_test_date, overtime_fee, oil_gauge, price, mile_fee, car_address, owner, valid_date, car_species, insurance_company }) {
        let res = await fetch_Asap_api({
            id, cre_userid, cre_time, upd_userid, upd_time, carService, belong, department, car_license, plate, type, power, carFormat, Color, leave_date, Licensing_date, Customer_call, rentType, rentStarday, rentEndday, periods, securityMoney, monthlyrentMoney, HandleSales, UndertakeSales, remark, carType, InsuranceType, engine_displacement, milage, engine_number, fuel, position, rent_status, carrier, specified_test_date, pass_test_date, overtime_fee, oil_gauge, price, mile_fee, car_address, owner, valid_date, car_species, insurance_company
        }, "CarManage/Update");
        if (res == "Update Success") return new ResultObj({ success: true, data: res, message: "更新成功" });
        else return new ResultObj({ success: false, data: res, message: "更新失敗" });
    }
    /**
    * 車籍查詢
     * @author Ellie
     * @param {*} carService 車籍服務種類
     * @param {*} belong 車子所在門市
     * @param {*} position 車子所在位置
     * @param {*} car_species 車子所在位置
     * @param {*} department 部門
     * @param {*} car_license 車號
     * @param {*} plate 車廠
     * @param {*} type 車型
     * @param {*} power 動力
     * @param {*} carFormat 車型規格備註
     * @param {*} Color 車色
     * @param {*} Customer_call 客戶簡稱
     * @param {*} rentType 租賃方式
     * @param {*} engine_displacement 排氣量
     * @param {*} specified_test_date 指定檢驗日期
     * @param {*} rent_status 租車狀態
     * @param {*} page 頁碼
     */
    let _Search = async function ({ carService, belong, department, position, car_license, plate, type, power, carFormat, Color, Customer_call, rentType, engine_displacement, car_species, specified_test_date, rent_status, page }) {
        let res = await fetch_Asap_api({
            carService, belong, department, position, car_license, plate, type, power, carFormat, car_species, Color, Customer_call, rentType, engine_displacement, specified_test_date, rent_status, page,
        }, "CarManage/Search");
        if (res == "查詢失敗") return new ResultObj({ success: false, data: res, message: "查詢失敗" });
        else return new ResultObj({ success: true, data: res, message: "查詢成功" });
    }

    /**
     * 車籍明細
     * @author Ellie
     * @param {*} id 編號
     */
    let _Detail = async function ({ id, type, power }) {
        let res = await fetch_Asap_api({ id, type, power }, "CarManage/CarDetail");
        if (res.length == 0) return new ResultObj({ success: false, data: res, message: "明細查詢失敗" });
        else if (res.message == "參數錯誤") return new ResultObj({ success: false, data: res, message: "參數錯誤" });
        else return new ResultObj({ success: true, data: res, message: "明細查詢成功" });
    }

    /**
     * 車籍刪除
     * @author Ellie
     * @param {*} id 編號
     */
    let _Delete = async function ({ id }) {
        let res = await fetch_Asap_api({ id }, "CarManage/Delete");
        if (res.toLowerCase() == "delete success") return new ResultObj({ success: true, data: res, message: "車籍刪除成功" });
        else return new ResultObj({ success: false, data: res, message: "車籍刪除失敗" });
    }

    return {
        _Create,
        _Update,
        _Search,
        _Detail,
        _Delete
    }
})()

const CustomerAPI = (() => {
    /**
     * 新建客戶
     * @param {*} name 客戶姓名
     * @param {*} id 身分證/護照號碼
     * @param {*} phone 手機號碼
     * @param {*} birth 出生年月日
     * @param {*} gender 性別
     * @param {*} license 駕照號碼
     * @param {*} jurisdictionC 汽車管轄編號
     * @param {*} jurisdictionM 機車管轄編號
     * @param {*} address 戶籍地址
     * @param {*} license_address 駕照地址
     * @param {*} tax_id 統一編號
     * @param {*} tax_name 公司抬頭
     * @param {*} mail 信箱
     * @param {*} ispicky 備註
     * @param {*} picky_reason 原因
     * @param {*} contact_name 緊急連絡人
     * @param {*} contact_phone 緊急連絡人電話
     * @param {*} contact_relation 緊急連絡人關係
     * @param {*} source 客戶來源
     * @param {*} password 密碼
     * @param {*} status 一般/天使客人
     */
    let _Create = async function ({ name, id, phone, birth, gender, license, jurisdictionC, jurisdictionM, address, license_address, tax_id, tax_name, mail, ispicky, picky_reason, contact_name, contact_phone, contact_relation, source, password, status }) {
        let res = await fetch_Asap_api({
            name,
            id,
            phone,
            birth,
            gender,
            license,
            jurisdictionC,
            jurisdictionM,
            address,
            license_address,
            tax_id,
            tax_name,
            mail,
            ispicky,
            picky_reason,
            contact_name,
            contact_phone,
            contact_relation,
            source,
            password,
            status,
        }, "customer/Create");

        if (res == "Create Success") return new ResultObj({ success: true, data: res, message: "新建成功" });
        else if (res == "Customer already exists") return new ResultObj({ success: false, data: res, message: "新建失敗，客戶已存在" });
        else return new ResultObj({ success: false, data: res, message: "新建失敗" });
    }
    /**
     * 編輯客戶
     * @param {*} origin_id 原本的身分證/護照號碼
     * @param {*} name 客戶姓名
     * @param {*} id 身分證/護照號碼
     * @param {*} phone 手機號碼
     * @param {*} birth 出生年月日
     * @param {*} gender 性別
     * @param {*} license 駕照號碼
     * @param {*} jurisdictionC 汽車管轄編號
     * @param {*} jurisdictionM 機車管轄編號
     * @param {*} address 戶籍地址
     * @param {*} license_address 駕照地址
     * @param {*} tax_id 統一編號
     * @param {*} tax_name 公司抬頭
     * @param {*} mail 信箱
     * @param {*} ispicky 備註
     * @param {*} picky_reason 原因
     * @param {*} contact_name 緊急連絡人
     * @param {*} contact_phone 緊急連絡人電話
     * @param {*} contact_relation 緊急連絡人關係
     * @param {*} source 客戶來源
     * @param {*} password 密碼
     * @param {*} status 一般/天使客人
     */
    let _Update = async function ({ origin_id, name, id, phone, birth, gender, license, jurisdictionC, jurisdictionM, address, license_address, tax_id, tax_name, mail, ispicky, picky_reason, contact_name, contact_phone, contact_relation, source, password, status }) {
        let res = await fetch_Asap_api({
            name,
            origin_id,
            id,
            phone,
            birth,
            gender,
            license,
            jurisdictionC,
            jurisdictionM,
            address,
            license_address,
            tax_id,
            tax_name,
            mail,
            ispicky,
            picky_reason,
            contact_name,
            contact_phone,
            contact_relation,
            source,
            password,
            status,
        }, "customer/Update");
        if (res == "Update Success") return new ResultObj({ success: true, data: res, message: "編輯成功" });
        else return new ResultObj({ success: false, data: res, message: "編輯失敗" });
    }

    /**
     * 客戶查詢
     * @param {*} id 身分證
     * @param {*} name 客戶姓名
     * @param {*} phone 手機號碼
     * @param {*} birth 生日
     * @param {*} page 頁碼
     */
    let _Search = async function ({ id, name, phone, birth, page }) {
        let res = await fetch_Asap_api({ id, name, phone, birth, page }, "customer/Search");
        if (res == "查詢失敗") return new ResultObj({ success: false, data: res, message: "查詢失敗" });
        else return new ResultObj({ success: true, data: res, message: "查詢成功" });
    }

    /**
     * 客戶明細
     * @param {*} id 身分證
     */
    let _Detail = async function ({ id = null }) {
        if (id === null) return new ResultObj({ success: false, message: "customer/CustomerDetail id身分證 為必填" });

        let res = await fetch_Asap_api({ id }, "customer/CustomerDetail");
        if (res.length == 0) return new ResultObj({ success: false, data: res, message: "明細查詢失敗" });
        else if (res.message == "參數錯誤") return new ResultObj({ success: false, data: res, message: "參數錯誤" });
        else return new ResultObj({ success: true, data: res, message: "明細查詢成功" });
    }

    /**
     * 客戶刪除
     * @param {*} id 身分證
     */
    let _Delete = async function ({ id = null }) {
        if (id === null) return new ResultObj({ success: false, message: "customer/Delete id身分證 為必填" });

        let res = await fetch_Asap_api({ id }, "customer/Delete");
        if (res == "Delete Success") return new ResultObj({ success: true, data: res, message: "客戶刪除成功" });
        else if (res == "User different") return new ResultObj({ success: false, data: res, message: "客戶刪除失敗" });
        else return new ResultObj({ success: false, data: res, message: "客戶刪除失敗" });
    }

    return {
        _Create,
        _Search,
        _Detail,
        _Delete,
        _Update
    }
})()