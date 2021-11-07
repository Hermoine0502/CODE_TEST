$(function () {
    pullMenu('#getlocation', { pos: "" }, 'OW_Transfer/List', 'pos');
    $("#getlocation").on('change', function () {
        pullMenu('#Hours', { pos: $('#getlocation').val() }, 'OW_Transfer/List', 'time');
    })
    $('.btn-search').on('click', function () {
        let obj = {
            pos: $('#getlocation').val(),
            mode: $('#Hours').val()
        }
        let price = 0;
        let checkedState = checkForm();
        if (checkedState) {
            front_ajax_api(obj, 'OW_Transfer/Search'); //CALL API
            switch ($('#Hours').val()) {
                case "加點":
                    if ($('#searchcar').val() == '0') {
                        price = api_data[0].im_five;
                    } else if ($('#searchcar').val() == '1') {
                        price = api_data[0].im_nine;
                    } else {
                        price = api_data[0].nine;
                    }
                    break;
                case "車租":
                    if ($('#searchcar').val() == '0') {
                        price = api_data[0].im_five;
                    } else if ($('#searchcar').val() == '1') {
                        price = api_data[0].im_nine;
                    } else {
                        price = api_data[0].nine;
                    }
                    break;
            }
            var newHtml = '';
            newHtml += $('#Hours').val() + ' ' + price + '元台幣';
            $('.answer > p').html(newHtml);
            antionAnimated('.answer > p', 'zoomIn');

        }
        return false;
    })
})

function checkForm() {
    let checkObj = {
        getlocation: $('#getlocation').val(),
        Hours: $('#Hours').val(),
        searchcar: $('#searchcar').val()
    }
    for (a in checkObj) {
        if (checkObj[a] == '') {
            $('.answer > p').html('-- 請選擇' + $('#' + a).prev().text() + ' --')
            $('#' + a).focus();
            antionAnimated('.answer > p', 'zoomIn')
            return false
        }
    }
    return true
}