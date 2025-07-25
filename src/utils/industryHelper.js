export const getIndustryColumns = () => {
	return [{
		title: '一级赛道',
    	align: 'center',
		dataIndex: 'domain1',
		width: 200,
		resizable: true,
		sorter: true,
		slot: 'editCommon'
	}, {
		title: '二级赛道',
	    align: 'center',
	    dataIndex: 'domain2',
		width: 200,
		resizable: true,
		sorter: true,
		slot: 'editCommon'
	}, {
		title: '三级赛道',
	    align: 'center',
	    dataIndex: 'domain3',
		width: 200,
		resizable: true,
		sorter: true,
		slot: 'editCommon'
	}, {
		title: '优先级',
	    align: 'center',
	    dataIndex: 'priority',
		width: 100,
	    resizable: true,
	    sorter: true,
		slot: 'editCommon'
	}, {
		title: '主理人',
	    align: 'center',
	    dataIndex: 'main',
		width: 150,
	    resizable: true,
	    sorter: true,
		slot: 'editCommon'
	}, {
		title: '协理人',
	    align: 'center',
	    dataIndex: 'assistant',
	    width: 150,
	    resizable: true,
	    sorter: true,
		slot: 'editCommon'
	}, {
		title: '操作',
	    align: 'center',
	    dataIndex: 'action',
		slot: "action",
	    width: 100,
	    resizable: true,
		fixed: 'right',
		columnSettingDrag: false, // 禁止拖拽
		columnSettingFixed: 'bottom', // 固定在底部
	}]
}