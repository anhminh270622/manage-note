export default {
    dataSource: [
        {
            key: '1',
            name: 'John Brown',
            amount: 3243256466,
            startDate: '10/02/2025',
            endDate: "12/05/2025",
            note: "hehe",
            tag: 0
        },
        {
            key: '2',
            name: 'Jim Green',
            amount: 4232423432,
            startDate: '10/02/2025',
            endDate: "12/05/2025",
            note: "hehe",
            tag: 1
        },
        {
            key: '3',
            name: 'Joe Black',
            amount: 3200000,
            startDate: '10/02/2025',
            endDate: "12/05/2025",
            note: "hehe",
            tag: 1
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
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
        },
        {
            title: 'Tag',
            dataIndex: 'tag',
            key: 'tag',
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
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
        { name: 'Thu chi', path: '/revenue' },
    ],
    getTags: [
        { id: 0, name: 'Cho vay' },
        { id: 1, name: 'Nợ' },
        { id: 2, name: 'Khác' },
    ]

}