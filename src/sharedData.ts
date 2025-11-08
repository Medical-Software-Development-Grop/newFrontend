export interface Sample {
  id: string;
  type: string;
  patientName: string;
  sampleNumber: string;
  status: "图像已审核" | "报告已审核" | "未审核";
}

export const samples: Sample[] = [
  { id: "1", type: "血涂本", patientName: "张三", sampleNumber: "250725114944020", status: "图像已审核" },
  { id: "2", type: "血涂本", patientName: "李四", sampleNumber: "250725114944021", status: "报告已审核" },
  { id: "3", type: "血涂本", patientName: "王五", sampleNumber: "250725114944022", status: "未审核" },
  { id: "4", type: "血涂本", patientName: "赵六", sampleNumber: "250725114944023", status: "图像已审核" },
  { id: "5", type: "血涂本", patientName: "钱七", sampleNumber: "250725114944024", status: "图像已审核" },
  { id: "6", type: "血涂本", patientName: "孙八", sampleNumber: "250725114944025", status: "图像已审核" },
  { id: "7", type: "血涂本", patientName: "周九", sampleNumber: "250725114944026", status: "报告已审核" },
  { id: "8", type: "血涂本", patientName: "吴十", sampleNumber: "250725114944027", status: "图像已审核" },
  { id: "9", type: "血涂本", patientName: "郑十一", sampleNumber: "250725114944028", status: "图像已审核" },
  { id: "10", type: "血涂本", patientName: "王十二", sampleNumber: "250725114944029", status: "未审核" },
  { id: "11", type: "血涂本", patientName: "李十三", sampleNumber: "250725114944030", status: "图像已审核" },
  { id: "12", type: "血涂本", patientName: "张十四", sampleNumber: "250725114944031", status: "报告已审核" },
  { id: "13", type: "血涂本", patientName: "刘十五", sampleNumber: "250725114944032", status: "未审核" },
  { id: "14", type: "血涂本", patientName: "陈十六", sampleNumber: "250725114944033", status: "图像已审核" },
  { id: "15", type: "血涂本", patientName: "杨十七", sampleNumber: "250725114944034", status: "图像已审核" },
  { id: "16", type: "血涂本", patientName: "黄十八", sampleNumber: "250725114944035", status: "报告已审核" },
  { id: "17", type: "血涂本", patientName: "林十九", sampleNumber: "250725114944036", status: "未审核" },
  { id: "18", type: "血涂本", patientName: "何二十", sampleNumber: "250725114944037", status: "图像已审核" },
  { id: "19", type: "血涂本", patientName: "郭二一", sampleNumber: "250725114944038", status: "图像已审核" },
  { id: "20", type: "血涂本", patientName: "马二二", sampleNumber: "250725114944039", status: "报告已审核" }
];

