// chỉ nhập số
export function isNumber(event) {
    const evt = event || window.event
    var charCode = evt.which ? evt.which : evt.keyCode
    if (
        (charCode >= 48 && charCode <= 57) ||
        (charCode === 67 && (event.ctrlKey || event.metaKey)) ||
        (charCode === 86 && (event.ctrlKey || event.metaKey))
    ) {
        return true
    } else {
        return evt.preventDefault()
    }
}

export function validatePhoneNumber(event) {
    let inputValue = event.target.value;

    // Chỉ cho phép nhập số và bắt đầu bằng số 0
    inputValue = inputValue.replace(/[^0-9]/g, ''); // Chỉ cho phép nhập số
    if (inputValue.length > 0 && inputValue.charAt(0) !== '0') {
        inputValue = '0' + inputValue.slice(1); // Đảm bảo số bắt đầu bằng 0
    }

    event.target.value = inputValue;
}