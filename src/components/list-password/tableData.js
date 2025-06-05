export default {
    dataSource: [
        {
            key: '1',
            name: 'Anh Nguyễn1',
            username: "anhnguyen",
            password: '123458',
            phone: "0346588848",
        },
        {
            key: '2',
            name: 'Anh Nguyễn2',
            username: "anhnguyen",
            password: '123458',
            phone: "0346588848"
        },
        {
            key: '3',
            name: 'Anh Nguyễn3',
            username: "anhnguyen",
            password: '123458',
            phone: "0346588848"
        },
    ],
    columns: [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: '80px',
            align: 'center',
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Mật khẩu',
            dataIndex: 'password',
            key: 'password',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            fixed: 'right',
        },
    ],
    breadcrumb: [
        { name: 'Trang chủ', path: '/' },
        { name: 'Danh sách', path: '/list-password' },
    ],
    dataBox: [
        { name: 'Google', value: "google", },
        { name: 'Facebook', value: "facebook" },
        { name: 'Twitter', value: "twitter" },
        { name: 'Instagram', value: "instagram" },
    ]
}