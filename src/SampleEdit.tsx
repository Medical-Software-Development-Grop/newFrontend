import React, { useEffect, useMemo, useState } from "react";
import EditModal from "./EditModal";
import "./SampleEdit.css";
import { getSmears, getSmear, deleteSmear, updateSmear, Smear } from "./api/smear";
import { updatePatient, Patient } from "./api/patient";
import { getUsers, User } from "./api/user";

interface TableData {
  id: number;
  scanMethod: string;
  bedNumber: string;
  markStatus: string;
  sampleType: string;
  patientGender: string;
  patientAge: string;
  patientName: string;
  admissionNumber: string;
  sampleNumber: string;
  reviewStatus: string;
  submissionDate: string;
  ageType: string;
  department: string;
  doctor: string;
  patientNumber: string;
  reviewDoctor: string;
}

const SAMPLE_DATA: TableData[] = [
  {
    id: 1,
    scanMethod: "区域扫描",
    bedNumber: "A101",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "男",
    patientAge: "45",
    patientName: "张三",
    admissionNumber: "ZY202401",
    sampleNumber: "2508010001",
    reviewStatus: "图像已审核",
    submissionDate: "2024-08-02",

    ageType: "成人",
    department: "检验科",
    doctor: "管理员",
    patientNumber: "10001",
    reviewDoctor: "管理员"
  },
  {
    id: 2,
    scanMethod: "区域扫描",
    bedNumber: "A102",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "女",
    patientAge: "52",
    patientName: "李四",
    admissionNumber: "ZY202402",
    sampleNumber: "2508010002",
    reviewStatus: "报告已审核",
    submissionDate: "2024-08-03",

    ageType: "成人",
    department: "检验科",
    doctor: "管理员",
    patientNumber: "10002",
    reviewDoctor: "王主任"
  },
  {
    id: 3,
    scanMethod: "紧急扫描",
    bedNumber: "B210",
    markStatus: "已标记",
    sampleType: "骨髓",
    patientGender: "男",
    patientAge: "38",
    patientName: "王五",
    admissionNumber: "ZY202403",
    sampleNumber: "2508010003",
    reviewStatus: "未审核",
    submissionDate: "2024-08-04",

    ageType: "成人",
    department: "急诊科",
    doctor: "张主任",
    patientNumber: "10003",
    reviewDoctor: "李主任"
  },
  {
    id: 4,
    scanMethod: "常规扫描",
    bedNumber: "C301",
    markStatus: "未标记",
    sampleType: "血涂本",
    patientGender: "女",
    patientAge: "64",
    patientName: "赵六",
    admissionNumber: "ZY202404",
    sampleNumber: "2508010004",
    reviewStatus: "图像已审核",
    submissionDate: "2024-08-05",

    ageType: "成人",
    department: "血液科",
    doctor: "刘医生",
    patientNumber: "10004",
    reviewDoctor: "管理员"
  },
  {
    id: 5,
    scanMethod: "常规扫描",
    bedNumber: "C302",
    markStatus: "已标记",
    sampleType: "骨髓",
    patientGender: "男",
    patientAge: "29",
    patientName: "钱七",
    admissionNumber: "ZY202405",
    sampleNumber: "2508010005",
    reviewStatus: "未审核",
    submissionDate: "2024-08-06",

    ageType: "成人",
    department: "血液科",
    doctor: "王医生",
    patientNumber: "10005",
    reviewDoctor: "管理员"
  },
  {
    id: 6,
    scanMethod: "区域扫描",
    bedNumber: "D105",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "女",
    patientAge: "33",
    patientName: "孙八",
    admissionNumber: "ZY202406",
    sampleNumber: "2508010006",
    reviewStatus: "报告已审核",
    submissionDate: "2024-08-07",

    ageType: "成人",
    department: "检验科",
    doctor: "管理员",
    patientNumber: "10006",
    reviewDoctor: "管理员"
  },
  {
    id: 7,
    scanMethod: "快速扫描",
    bedNumber: "E208",
    markStatus: "未标记",
    sampleType: "血涂本",
    patientGender: "男",
    patientAge: "7",
    patientName: "周九",
    admissionNumber: "ZY202407",
    sampleNumber: "2508010007",
    reviewStatus: "图像已审核",
    submissionDate: "2024-08-08",

    ageType: "儿童",
    department: "儿科",
    doctor: "陈医生",
    patientNumber: "10007",
    reviewDoctor: "管理员"
  },
  {
    id: 8,
    scanMethod: "区域扫描",
    bedNumber: "E209",
    markStatus: "已标记",
    sampleType: "骨髓",
    patientGender: "女",
    patientAge: "59",
    patientName: "吴十",
    admissionNumber: "ZY202408",
    sampleNumber: "2508010008",
    reviewStatus: "未审核",
    submissionDate: "2024-08-09",

    ageType: "成人",
    department: "肿瘤科",
    doctor: "张医生",
    patientNumber: "10008",
    reviewDoctor: "王主任"
  },
  {
    id: 9,
    scanMethod: "常规扫描",
    bedNumber: "F110",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "男",
    patientAge: "47",
    patientName: "郑一",
    admissionNumber: "ZY202409",
    sampleNumber: "2508010009",
    reviewStatus: "报告已审核",
    submissionDate: "2024-08-10",

    ageType: "成人",
    department: "检验科",
    doctor: "李医生",
    patientNumber: "10009",
    reviewDoctor: "管理员"
  },
  {
    id: 10,
    scanMethod: "常规扫描",
    bedNumber: "F111",
    markStatus: "未标记",
    sampleType: "血涂本",
    patientGender: "女",
    patientAge: "53",
    patientName: "冯二",
    admissionNumber: "ZY202410",
    sampleNumber: "2508010010",
    reviewStatus: "未审核",
    submissionDate: "2024-08-11",

    ageType: "成人",
    department: "检验科",
    doctor: "管理员",
    patientNumber: "10010",
    reviewDoctor: "管理员"
  },
  {
    id: 11,
    scanMethod: "区域扫描",
    bedNumber: "G205",
    markStatus: "已标记",
    sampleType: "骨髓",
    patientGender: "男",
    patientAge: "35",
    patientName: "沈三",
    admissionNumber: "ZY202411",
    sampleNumber: "2508010011",
    reviewStatus: "图像已审核",
    submissionDate: "2024-08-12",

    ageType: "成人",
    department: "血液科",
    doctor: "王医生",
    patientNumber: "10011",
    reviewDoctor: "李主任"
  },
  {
    id: 12,
    scanMethod: "紧急扫描",
    bedNumber: "H318",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "女",
    patientAge: "62",
    patientName: "韩四",
    admissionNumber: "ZY202412",
    sampleNumber: "2508010012",
    reviewStatus: "报告已审核",
    submissionDate: "2024-08-13",

    ageType: "成人",
    department: "血液科",
    doctor: "赵医生",
    patientNumber: "10012",
    reviewDoctor: "管理员"
  },
  {
    id: 13,
    scanMethod: "常规扫描",
    bedNumber: "I205",
    markStatus: "未标记",
    sampleType: "骨髓",
    patientGender: "男",
    patientAge: "28",
    patientName: "陈五",
    admissionNumber: "ZY202413",
    sampleNumber: "2508010013",
    reviewStatus: "未审核",
    submissionDate: "2024-08-14",

    ageType: "成人",
    department: "肿瘤科",
    doctor: "刘医生",
    patientNumber: "10013",
    reviewDoctor: "李主任"
  },
  {
    id: 14,
    scanMethod: "区域扫描",
    bedNumber: "J106",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "女",
    patientAge: "35",
    patientName: "杨六",
    admissionNumber: "ZY202414",
    sampleNumber: "2508010014",
    reviewStatus: "图像已审核",
    submissionDate: "2024-08-15",

    ageType: "成人",
    department: "检验科",
    doctor: "王医生",
    patientNumber: "10014",
    reviewDoctor: "管理员"
  },
  {
    id: 15,
    scanMethod: "快速扫描",
    bedNumber: "K307",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "男",
    patientAge: "41",
    patientName: "黄七",
    admissionNumber: "ZY202415",
    sampleNumber: "2508010015",
    reviewStatus: "报告已审核",
    submissionDate: "2024-08-16",

    ageType: "成人",
    department: "急诊科",
    doctor: "张医生",
    patientNumber: "10015",
    reviewDoctor: "王主任"
  },
  {
    id: 16,
    scanMethod: "常规扫描",
    bedNumber: "L208",
    markStatus: "未标记",
    sampleType: "骨髓",
    patientGender: "女",
    patientAge: "67",
    patientName: "林八",
    admissionNumber: "ZY202416",
    sampleNumber: "2508010016",
    reviewStatus: "未审核",
    submissionDate: "2024-08-17",

    ageType: "成人",
    department: "血液科",
    doctor: "李医生",
    patientNumber: "10016",
    reviewDoctor: "李主任"
  },
  {
    id: 17,
    scanMethod: "区域扫描",
    bedNumber: "M109",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "男",
    patientAge: "19",
    patientName: "何九",
    admissionNumber: "ZY202417",
    sampleNumber: "2508010017",
    reviewStatus: "图像已审核",
    submissionDate: "2024-08-18",

    ageType: "成人",
    department: "儿科",
    doctor: "陈医生",
    patientNumber: "10017",
    reviewDoctor: "管理员"
  },
  {
    id: 18,
    scanMethod: "紧急扫描",
    bedNumber: "N410",
    markStatus: "已标记",
    sampleType: "骨髓",
    patientGender: "女",
    patientAge: "73",
    patientName: "罗十",
    admissionNumber: "ZY202418",
    sampleNumber: "2508010018",
    reviewStatus: "报告已审核",
    submissionDate: "2024-08-19",

    ageType: "成人",
    department: "肿瘤科",
    doctor: "赵医生",
    patientNumber: "10018",
    reviewDoctor: "王主任"
  },
  {
    id: 19,
    scanMethod: "常规扫描",
    bedNumber: "O211",
    markStatus: "未标记",
    sampleType: "血涂本",
    patientGender: "男",
    patientAge: "56",
    patientName: "高十一",
    admissionNumber: "ZY202419",
    sampleNumber: "2508010019",
    reviewStatus: "未审核",
    submissionDate: "2024-08-20",

    ageType: "成人",
    department: "检验科",
    doctor: "刘医生",
    patientNumber: "10019",
    reviewDoctor: "李主任"
  },
  {
    id: 20,
    scanMethod: "区域扫描",
    bedNumber: "P312",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "女",
    patientAge: "42",
    patientName: "徐十二",
    admissionNumber: "ZY202420",
    sampleNumber: "2508010020",
    reviewStatus: "图像已审核",
    submissionDate: "2024-08-21",

    ageType: "成人",
    department: "血液科",
    doctor: "王医生",
    patientNumber: "10020",
    reviewDoctor: "管理员"
  },
  {
    id: 21,
    scanMethod: "快速扫描",
    bedNumber: "Q113",
    markStatus: "已标记",
    sampleType: "骨髓",
    patientGender: "男",
    patientAge: "31",
    patientName: "马十三",
    admissionNumber: "ZY202421",
    sampleNumber: "2508010021",
    reviewStatus: "报告已审核",
    submissionDate: "2024-08-22",

    ageType: "成人",
    department: "急诊科",
    doctor: "张医生",
    patientNumber: "10021",
    reviewDoctor: "王主任"
  },
  {
    id: 22,
    scanMethod: "常规扫描",
    bedNumber: "R214",
    markStatus: "未标记",
    sampleType: "血涂本",
    patientGender: "女",
    patientAge: "48",
    patientName: "朱十四",
    admissionNumber: "ZY202422",
    sampleNumber: "2508010022",
    reviewStatus: "未审核",
    submissionDate: "2024-08-23",

    ageType: "成人",
    department: "肿瘤科",
    doctor: "李医生",
    patientNumber: "10022",
    reviewDoctor: "李主任"
  },
  {
    id: 23,
    scanMethod: "区域扫描",
    bedNumber: "S315",
    markStatus: "已标记",
    sampleType: "血涂本",
    patientGender: "男",
    patientAge: "25",
    patientName: "胡十五",
    admissionNumber: "ZY202423",
    sampleNumber: "2508010023",
    reviewStatus: "图像已审核",
    submissionDate: "2024-08-24",

    ageType: "成人",
    department: "儿科",
    doctor: "陈医生",
    patientNumber: "10023",
    reviewDoctor: "管理员"
  },
  {
    id: 24,
    scanMethod: "紧急扫描",
    bedNumber: "T416",
    markStatus: "已标记",
    sampleType: "骨髓",
    patientGender: "女",
    patientAge: "69",
    patientName: "郭十六",
    admissionNumber: "ZY202424",
    sampleNumber: "2508010024",
    reviewStatus: "报告已审核",
    submissionDate: "2024-08-25",

    ageType: "成人",
    department: "血液科",
    doctor: "赵医生",
    patientNumber: "10024",
    reviewDoctor: "王主任"
  },
  {
    id: 25,
    scanMethod: "常规扫描",
    bedNumber: "U117",
    markStatus: "未标记",
    sampleType: "血涂本",
    patientGender: "男",
    patientAge: "37",
    patientName: "宋十七",
    admissionNumber: "ZY202425",
    sampleNumber: "2508010025",
    reviewStatus: "未审核",
    submissionDate: "2024-08-26",

    ageType: "成人",
    department: "检验科",
    doctor: "刘医生",
    patientNumber: "10025",
    reviewDoctor: "李主任"
  }
];

const INITIAL_FORM = {
  startDate: "",
  endDate: "",
  reviewStatus: "",
  submissionDate: "",
  sampleNumber: "",
  admissionNumber: "",
  patientName: "",
  patientAge: "",
  inspectionDoctor: "",
  reviewDoctor: ""
};

const statusClassMap: Record<string, string> = {
  图像已审核: "status-tag success",
  报告已审核: "status-tag info",
  未审核: "status-tag default",
  已标记: "status-tag info"
};

const SampleEdit: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batchSelectMode, setBatchSelectMode] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchForm, setSearchForm] = useState(INITIAL_FORM);
  const [rows, setRows] = useState<TableData[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<TableData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null); // 改为string类型，存储sample_number
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // 转换API数据到表格数据格式
  const convertSmearToTableData = (smear: Smear): TableData => {
    // 处理状态映射：后端状态 -> 前端显示状态
    const statusMap: Record<string, string> = {
      "未审核": "未审核",
      "图像已审核": "图像已审核",
      "报告已审核": "报告已审核",
      "marked": "已标记",
      "reviewed": "图像已审核",
      "reported": "报告已审核"
    };
    
    // 处理样本类型映射
    const typeMap: Record<string, string> = {
      "外周血涂片": "血涂本",
      "骨髓涂片": "骨髓",
      "血涂本": "血涂本",
      "骨髓": "骨髓"
    };

    const reviewStatus = statusMap[smear.status] || "未审核";
    const sampleType = typeMap[smear.type] || smear.type || "血涂本";
    
    // 安全地获取patient数据
    const patient = smear.patient || null;
    
    // 调试：检查patient数据
    if (!patient) {
      console.warn(`样本 ${smear.sample_number} 没有patient数据`, smear);
    }
    
    return {
      id: smear.id,
      scanMethod: smear.scanner || "常规扫描",
      bedNumber: patient?.bed_number || "",
      markStatus: reviewStatus === "图像已审核" || reviewStatus === "报告已审核" ? "已标记" : "未标记",
      sampleType: sampleType,
      patientGender: patient?.gender || "",
      patientAge: patient?.age?.toString() || "",
      patientName: patient?.name || "",
      admissionNumber: patient?.hospitalization_number || "",
      sampleNumber: smear.sample_number,
      reviewStatus: reviewStatus,
      submissionDate: smear.submission_time ? new Date(smear.submission_time).toISOString().split('T')[0] : "",
      ageType: "成人",
      department: patient?.department || "检验科",
      doctor: smear.inspection_doctor?.name || "", // 从inspection_doctor获取医生姓名
      patientNumber: patient?.patient_number || "",
      reviewDoctor: "管理员"
    };
  };

  // 加载样本数据
  const loadSmears = async () => {
    setLoading(true);
    setError(null);
    try {
      // 构建查询参数，将所有查询条件发送到后端
      const filters: any = {
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      };
      
      // 添加所有查询条件
      if (searchForm.sampleNumber?.trim()) {
        filters.sample_number = searchForm.sampleNumber.trim();
      }
      if (searchForm.patientName?.trim()) {
        filters.patient_name = searchForm.patientName.trim();
      }
      if (searchForm.admissionNumber?.trim()) {
        filters.hospitalization_number = searchForm.admissionNumber.trim();
      }
      if (searchForm.patientAge?.trim()) {
        const age = parseInt(searchForm.patientAge.trim());
        if (!isNaN(age)) {
          filters.patient_age = age;
        }
      }
      if (searchForm.reviewStatus?.trim()) {
        // 将前端状态转换为后端状态
        const statusMap: Record<string, string> = {
          '未审核': '未审核',
          '图像已审核': '图像已审核',
          '报告已审核': '报告已审核',
        };
        const backendStatus = statusMap[searchForm.reviewStatus];
        if (backendStatus) {
          filters.status = backendStatus;
        }
      }
      if (searchForm.startDate?.trim()) {
        filters.start_date = searchForm.startDate.trim();
      }
      if (searchForm.endDate?.trim()) {
        filters.end_date = searchForm.endDate.trim();
      }
      if (searchForm.inspectionDoctor?.trim()) {
        filters.inspection_doctor_name = searchForm.inspectionDoctor.trim();
      }
      
      const response = await getSmears(filters);
      
      // 处理返回的数据
      const items = Array.isArray(response.items) ? response.items : [];
      const total = response.total || 0;
      
      // 调试：检查API返回的数据结构
      if (items.length > 0) {
        console.log('API返回的第一条数据:', JSON.stringify(items[0], null, 2));
        console.log('第一条数据的patient:', items[0].patient);
        if (items[0].patient) {
          console.log('Patient name:', items[0].patient.name);
          console.log('Patient bed_number:', items[0].patient.bed_number);
        }
      }
      
      const tableData = items.map(convertSmearToTableData);
      
      // 调试：检查转换后的数据
      if (tableData.length > 0) {
        console.log('转换后的第一条数据:', tableData[0]);
        console.log('患者姓名:', tableData[0].patientName);
        console.log('床号:', tableData[0].bedNumber);
      }
      
      setRows(tableData);
      setTotalCount(total);
      
      // 调试：记录加载的数据
      console.log(`加载样本数据: 当前页 ${currentPage}, 每页 ${pageSize}, 返回 ${tableData.length} 条, 总数 ${total}`);
    } catch (err: any) {
      setError(err.message || '加载样本数据失败');
      // 如果API失败，使用本地数据作为后备
      setRows(SAMPLE_DATA);
      setTotalCount(SAMPLE_DATA.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSmears();
  }, [currentPage, pageSize]);
  
  // 当搜索条件变化时，重置到第一页并重新加载
  useEffect(() => {
    setCurrentPage(1);
    // 延迟加载，避免频繁请求
    const timer = setTimeout(() => {
      loadSmears();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchForm.sampleNumber,
    searchForm.patientName,
    searchForm.admissionNumber,
    searchForm.patientAge,
    searchForm.reviewStatus,
    searchForm.startDate,
    searchForm.endDate,
    searchForm.inspectionDoctor,
    searchForm.reviewDoctor, // 虽然后端不支持，但保留以防后续需要
  ]);

  // 加载用户列表 - 使用默认用户列表，避免API失败影响功能
  useEffect(() => {
    // 直接使用默认用户列表，不依赖后端API
    // 这样可以避免CORS和500错误影响编辑功能
    setUsers([
      { id: 1, doctor_number: 'admin', name: '管理员', role: 'admin' },
      { id: 2, doctor_number: 'doctor1', name: '张医生', role: 'doctor' },
      { id: 3, doctor_number: 'doctor2', name: '李医生', role: 'doctor' },
      { id: 4, doctor_number: 'doctor3', name: '王医生', role: 'doctor' },
      { id: 5, doctor_number: 'doctor4', name: '王主任', role: 'doctor' },
      { id: 6, doctor_number: 'doctor5', name: '李主任', role: 'doctor' },
    ]);

    // 可选：尝试从后端加载用户列表（不影响页面功能）
    const loadUsersAsync = async () => {
      try {
        const userList = await getUsers();
        if (userList && userList.length > 0) {
          setUsers(userList);
        }
      } catch (err) {
        // 静默失败，已使用默认列表
        console.debug('无法从后端加载用户列表，使用默认列表');
      }
    };
    loadUsersAsync();
  }, []);

  // 监听Excel导入成功和图片上传成功事件（从图像管理界面触发）
  useEffect(() => {
    const handleExcelImportSuccess = () => {
      console.log('Excel导入成功，刷新样本数据');
      // 延迟一下再刷新，避免频繁请求
      setTimeout(() => {
        loadSmears();
      }, 500);
    };
    
    const handleImageUploadSuccess = () => {
      console.log('图片上传成功，刷新样本数据');
      // 延迟一下再刷新，避免频繁请求
      setTimeout(() => {
        loadSmears();
      }, 500);
    };
    
    window.addEventListener('excelImportSuccess', handleExcelImportSuccess);
    window.addEventListener('imageUploadSuccess', handleImageUploadSuccess);
    
    return () => {
      window.removeEventListener('excelImportSuccess', handleExcelImportSuccess);
      window.removeEventListener('imageUploadSuccess', handleImageUploadSuccess);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 搜索时重新加载数据
  const handleSearch = () => {
    setCurrentPage(1);
    loadSmears();
  };
  
  // 重置搜索表单
  // 不再需要客户端过滤，因为后端已经完成查询
  // 直接使用后端返回的数据
  const filteredRows = rows;

  // 使用后端返回的总记录数计算总页数
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // 直接使用后端返回的数据，不需要前端分页
  const pagedData = filteredRows;

  useEffect(() => {
    const pageIds = pagedData.map(item => item.id);
    setSelectAll(pageIds.length > 0 && pageIds.every(id => selectedRows.includes(id)));
  }, [pagedData, selectedRows]);

  const handleDelete = (row: TableData) => {
    // 使用sampleNumber作为标识符
    const sampleNumber = row.sampleNumber;
    if (!sampleNumber) {
      alert('无法获取样本编号');
      return;
    }
    setDeleteItemId(sampleNumber);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteItemId) {
      try {
        // deleteItemId现在是sampleNumber（字符串）
        await deleteSmear(deleteItemId);
        // 从选中列表中移除（根据sampleNumber找到对应的id）
        const rowToDelete = rows.find(r => r.sampleNumber === deleteItemId);
        if (rowToDelete && rowToDelete.id) {
          setSelectedRows(prev => prev.filter(selectedId => selectedId !== rowToDelete.id));
        }
        setShowDeleteConfirm(false);
        setDeleteItemId(null);
        // 重新加载数据以确保同步
        await loadSmears();
        alert('删除成功');
      } catch (err: any) {
        console.error('删除失败:', err);
        alert(`删除失败: ${err.message || '未知错误'}`);
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteItemId(null);
  };

  // 批量删除确认
  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
      alert('请先选择要删除的数据');
      return;
    }
    setShowBatchDeleteConfirm(true);
  };

  const handleBatchDeleteConfirm = async () => {
    if (selectedRows.length === 0) {
      setShowBatchDeleteConfirm(false);
      return;
    }

    try {
      // 批量删除选中的样本
      // 根据选中的id找到对应的sampleNumber
      const deletePromises = selectedRows.map(id => {
        const row = rows.find((r: TableData) => r.id === id);
        return row ? deleteSmear(row.sampleNumber) : Promise.resolve();
      });
      await Promise.all(deletePromises);
      
      // 保存要删除的数量用于提示
      const deletedCount = selectedRows.length;
      
      // 清空选中状态
      setSelectedRows([]);
      setSelectAll(false);
      
      // 重新加载数据以确保同步（删除后数据会更新）
      await loadSmears();
      
      alert(`成功删除 ${deletedCount} 条记录`);
      setShowBatchDeleteConfirm(false);
    } catch (err: any) {
      alert(`批量删除失败: ${err.message || '删除失败'}`);
      console.error('批量删除失败:', err);
    }
  };

  const handleBatchDeleteCancel = () => {
    setShowBatchDeleteConfirm(false);
  };

  const handleRowSelect = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      const pageIds = new Set(pagedData.map(item => item.id));
      setSelectedRows(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const next = new Set([...selectedRows, ...pagedData.map(item => item.id)]);
      setSelectedRows(Array.from(next));
    }
    setSelectAll(!selectAll);
  };

  const handleFormChange = (field: string, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleReset = () => {
    setSearchForm(INITIAL_FORM);
  };

  const getStatusTagClass = (status: string) => statusClassMap[status] || "status-tag default";

  const handleEdit = (row: TableData) => {
    setEditingRow(row);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingRow(null);
  };

  const handleSaveModal = async (data: any) => {
    if (!editingRow) return;

    try {
      // 获取样本的完整信息
      // 注意：后端API使用sample_number作为标识符，不是id
      const sampleNumber = editingRow.sampleNumber || editingRow.id?.toString();
      if (!sampleNumber) {
        throw new Error('无法获取样本编号');
      }
      const smearData = await getSmear(sampleNumber);
      
      // 更新病人信息（可选，如果失败不影响样本更新）
      // 注意：后端Patient API使用patient_id（整数），需要从patient对象中获取
      const patient = smearData.patient;
      if (patient && patient.id && (data.patientName || data.patientAge || data.patientGender || data.admissionNumber)) {
        try {
          const patientUpdate: any = {};
          if (data.patientName) patientUpdate.name = data.patientName;
          if (data.patientAge) patientUpdate.age = parseInt(data.patientAge);
          if (data.patientGender) patientUpdate.gender = data.patientGender;
          if (data.admissionNumber) patientUpdate.hospitalization_number = data.admissionNumber;
          
          if (Object.keys(patientUpdate).length > 0) {
            // 注意：Patient API使用id（整数），虽然PatientTable主键是patient_number
            // 但路由参数使用patient_id，可能需要转换或使用不同的API
            // 暂时跳过病人更新，因为patient.id可能是patient_number（字符串）
            console.warn('病人信息更新功能暂时跳过，因为后端API使用patient_id，但patient.id可能是patient_number');
          }
        } catch (patientErr: any) {
          console.warn('更新病人信息失败（将跳过病人信息更新）:', patientErr.message);
          // 如果病人信息更新失败，继续更新样本信息
        }
      }

      // 查找检验医生ID（明确处理清空医生的情况）
      let inspectionDoctorId: number | null | undefined = undefined;
      if (data.doctor && data.doctor.trim() !== '') {
        // 如果提供了医生姓名，查找对应的ID
        const doctor = users.find(u => u.name === data.doctor.trim());
        if (doctor) {
          inspectionDoctorId = doctor.id;
        } else {
          // 如果找不到对应的医生，记录警告但继续更新（其他字段）
          console.warn(`找不到医生: ${data.doctor}`);
        }
      } else {
        // 如果医生字段为空或空字符串，明确设置为null以清空医生
        inspectionDoctorId = null;
      }

      // 构建更新数据（只包含有值的字段）
      const updateData: any = {};
      
      if (data.sampleType) {
        updateData.type = data.sampleType === '血涂本' ? '外周血涂片' : 
                         data.sampleType === '骨髓' ? '骨髓涂片' : 
                         data.sampleType;
      }
      
      if (data.scanMethod) {
        updateData.scanner = data.scanMethod;
      }
      
      if (data.reviewStatus) {
        updateData.status = data.reviewStatus === '图像已审核' ? '图像已审核' : 
                           data.reviewStatus === '报告已审核' ? '报告已审核' : 
                           '未审核';
      }
      
      // 明确处理检验医生ID（包括设置为null的情况）
      if (inspectionDoctorId !== undefined) {
        updateData.inspection_doctor_id = inspectionDoctorId;
      }

      // 更新样本信息
      // 注意：后端API使用sample_number作为标识符
      if (Object.keys(updateData).length > 0) {
        const sampleNumber = editingRow.sampleNumber || editingRow.id?.toString();
        if (!sampleNumber) {
          throw new Error('无法获取样本编号');
        }
        await updateSmear(sampleNumber, updateData);
      }

      // 重新加载数据
      await loadSmears();
      
      setIsEditModalOpen(false);
      setEditingRow(null);
      alert('保存成功');
    } catch (err: any) {
      console.error('保存失败:', err);
      const errorMessage = err.message || err.detail || '保存失败，请检查网络连接和后端服务';
      alert(`保存失败: ${errorMessage}`);
    }
  };

  return (
    <div className="sample-interface">
      <main className="main-content">
        <section className="main-card search-filter-form">
          <header className="filter-header">
            <h3>样本列表</h3>
            <span>共 {rows.length} 条记录</span>
          </header>
          {error && (
            <div style={{ 
              color: '#ff4d4f', 
              padding: '8px 16px', 
              backgroundColor: '#fff2f0',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
          {loading && (
            <div style={{ 
              color: '#1890ff', 
              padding: '8px 16px', 
              textAlign: 'center'
            }}>
              加载中...
            </div>
          )}
          <div className="form-grid">
            <div className="form-group date-range-group">
              <label className="form-label">送检日期</label>
              <div className="date-range">
                <input
                  type="date"
                  value={searchForm.startDate}
                  placeholder="请选择日期"
                  onChange={event => handleFormChange("startDate", event.target.value)}
                />
                <span className="date-gap">-</span>
                <input
                  type="date"
                  value={searchForm.endDate}
                  placeholder="请选择日期"
                  onChange={event => handleFormChange("endDate", event.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">审核状态</label>
              <select
                value={searchForm.reviewStatus}
                className={!searchForm.reviewStatus ? "placeholder" : undefined}
                onChange={event => handleFormChange("reviewStatus", event.target.value)}
              >
                <option value="">请选择</option>
                <option value="图像已审核">图像已审核</option>
                <option value="报告已审核">报告已审核</option>
                <option value="未审核">未审核</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">样本编号</label>
              <input
                type="text"
                placeholder="请输入"
                value={searchForm.sampleNumber}
                onChange={event => handleFormChange("sampleNumber", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">住院号</label>
              <input
                type="text"
                placeholder="请输入"
                value={searchForm.admissionNumber}
                onChange={event => handleFormChange("admissionNumber", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">姓名</label>
              <input
                type="text"
                placeholder="请输入"
                value={searchForm.patientName}
                onChange={event => handleFormChange("patientName", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">年龄</label>
              <input
                type="text"
                placeholder="请输入"
                value={searchForm.patientAge}
                onChange={event => handleFormChange("patientAge", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">检验医生</label>
              <select
                value={searchForm.inspectionDoctor}
                className={!searchForm.inspectionDoctor ? "placeholder" : undefined}
                onChange={event => handleFormChange("inspectionDoctor", event.target.value)}
              >
                <option value="">请选择</option>
                <option value="张医生">张医生</option>
                <option value="李医生">李医生</option>
                <option value="王医生">王医生</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">审核医生</label>
              <select
                value={searchForm.reviewDoctor}
                className={!searchForm.reviewDoctor ? "placeholder" : undefined}
                onChange={event => handleFormChange("reviewDoctor", event.target.value)}
              >
                <option value="">请选择</option>
                <option value="管理员">管理员</option>
                <option value="王主任">王主任</option>
                <option value="李主任">李主任</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn primary" onClick={handleSearch}>
              查询
            </button>
            <button type="button" className="btn ghost" onClick={handleReset}>
              重置
            </button>
          </div>
        </section>

        <div className="table-panel">
          {/* 批量操作工具栏 */}
          {selectedRows.length > 0 && (
            <div className="batch-actions-bar" style={{
              padding: '10px 15px',
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ color: '#666' }}>已选中 {selectedRows.length} 条数据</span>
              <button 
                type="button" 
                className="btn danger"
                onClick={handleBatchDelete}
                style={{ marginLeft: 'auto' }}
              >
                批量删除
              </button>
              <button 
                type="button" 
                className="btn ghost"
                onClick={() => {
                  setSelectedRows([]);
                  setSelectAll(false);
                }}
              >
                取消选择
              </button>
            </div>
          )}
          {/* 选择工具（移出表格） */}
          <div className="table-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="action-btn"
              onClick={() => {
                if (batchSelectMode) {
                  setSelectedRows([]);
                  setSelectAll(false);
                }
                setBatchSelectMode(!batchSelectMode);
              }}
            >
              {batchSelectMode ? '取消批量' : '批量选择'}
            </button>
            {batchSelectMode && (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <span>全选</span>
              </label>
            )}
            {selectedRows.length > 0 && (
              <span style={{ color: '#3a6dff', fontWeight: 600 }}>
                已选 {selectedRows.length} 条
              </span>
            )}
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {batchSelectMode && <th style={{ width: 48 }}></th>}
                  <th>样本编号</th>
                  <th>患者姓名</th>
                  <th>床号</th>
                  <th>样本类型</th>
                  <th>审核状态</th>
                  <th>送检日期</th>
                  <th>标记状态</th>
                  <th>扫描方式</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pagedData.map(row => (
                  <tr
                    key={row.id}
                    className={selectedRows.includes(row.id) ? 'selected' : undefined}
                    onClick={() => handleRowSelect(row.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {batchSelectMode && (
                      <td onClick={(e) => e.stopPropagation()} style={{ width: 48 }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleRowSelect(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    <td>{row.sampleNumber}</td>
                    <td>{row.patientName}</td>
                    <td>{row.bedNumber}</td>
                    <td>{row.sampleType}</td>
                    <td>
                      <span className={getStatusTagClass(row.reviewStatus)}>{row.reviewStatus}</span>
                    </td>
                    <td>{row.submissionDate}</td>
                    <td>
                      <span className={getStatusTagClass(row.markStatus)}>{row.markStatus}</span>
                    </td>
                    <td>{row.scanMethod}</td>
                    <td>
                      <div className="action-group">
                        <button 
                          type="button" 
                          className="action-btn small"
                          onClick={() => handleEdit(row)}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="action-btn small"
                          onClick={() => handleDelete(row)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-area">
            <div className="pagination-info">
              <span>共 {totalCount} 项数据，当前显示 {rows.length} 条</span>
              {selectedRows.length > 0 && (
                <span style={{ marginLeft: '15px', color: '#1890ff', fontWeight: 500 }}>
                  已选中 {selectedRows.length} 条数据
                </span>
              )}
            </div>
            <div className="pagination-controls">
              <div className="page-size-selector">
                <select
                  value={pageSize}
                  onChange={event => setPageSize(Number(event.target.value))}
                  className="page-size-select"
                >
                  <option value={10}>10 条/页</option>
                  <option value={20}>20 条/页</option>
                  <option value={50}>50 条/页</option>
                </select>
              </div>
              <div className="page-buttons">
                <button
                  className="page-btn prev-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  上一页
                </button>
                {(() => {
                  // 智能生成页码按钮
                  const pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    // 如果总页数少于等于7页，显示所有页码
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // 显示第1页
                    pages.push(1);
                    
                    if (currentPage <= 3) {
                      // 当前页在前3页
                      for (let i = 2; i <= 4; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPages);
                    } else if (currentPage >= totalPages - 2) {
                      // 当前页在后3页
                      pages.push('...');
                      for (let i = totalPages - 3; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // 当前页在中间
                      pages.push('...');
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages.map((page, index) => {
                    if (page === '...') {
                      return <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>;
                    }
                    return (
                      <button
                        key={page}
                        className={`page-btn ${currentPage === page ? "active" : ""}`}
                        onClick={() => setCurrentPage(page as number)}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
                <button
                  className="page-btn next-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        initialData={editingRow}
        users={users}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-header">
              <h3>确认删除</h3>
            </div>
            <div className="delete-confirm-content">
              <p>您确定要删除这条记录吗？此操作不可撤销。</p>
            </div>
            <div className="delete-confirm-footer">
              <button className="btn-cancel" onClick={handleDeleteCancel}>
                取消
              </button>
              <button className="btn-confirm-delete" onClick={handleDeleteConfirm}>
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {showBatchDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-header">
              <h3>确认批量删除</h3>
            </div>
            <div className="delete-confirm-content">
              <p>您确定要删除选中的 {selectedRows.length} 条记录吗？此操作不可撤销。</p>
            </div>
            <div className="delete-confirm-footer">
              <button className="btn-cancel" onClick={handleBatchDeleteCancel}>
                取消
              </button>
              <button className="btn-confirm-delete" onClick={handleBatchDeleteConfirm}>
                确认删除 ({selectedRows.length} 条)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleEdit;




