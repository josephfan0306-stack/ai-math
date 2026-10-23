// 康軒版國中數學（108 課綱）章節，依各冊目錄整理；若版本更新可直接修改此檔
export type Semester = "上" | "下";

export type Chapter = {
  no: number;
  title: string;
  sections: string[]; // 依序為 n-1、n-2 …
};

export type Volume = {
  grade: 7 | 8 | 9;
  semester: Semester;
  chapters: Chapter[];
};

export const CURRICULUM: Volume[] = [
  {
    grade: 7,
    semester: "上",
    chapters: [
      {
        no: 1,
        title: "整數的運算",
        sections: ["負數與數線", "整數的加減", "整數的乘除與四則運算", "指數記法與科學記號"],
      },
      {
        no: 2,
        title: "分數的運算",
        sections: ["質因數分解", "最大公因數與最小公倍數", "分數的加減", "分數的乘除與四則運算"],
      },
      {
        no: 3,
        title: "一元一次方程式",
        sections: ["代數式的化簡", "一元一次方程式的解法", "一元一次方程式的應用"],
      },
    ],
  },
  {
    grade: 7,
    semester: "下",
    chapters: [
      {
        no: 1,
        title: "二元一次聯立方程式",
        sections: ["二元一次方程式", "解二元一次聯立方程式", "二元一次聯立方程式的應用"],
      },
      {
        no: 2,
        title: "直角坐標與二元一次方程式的圖形",
        sections: ["直角坐標平面", "二元一次方程式的圖形"],
      },
      { no: 3, title: "比與比例", sections: ["比例式", "正比與反比"] },
      { no: 4, title: "一元一次不等式", sections: ["認識一元一次不等式", "解一元一次不等式與應用"] },
      { no: 5, title: "線對稱與三視圖", sections: ["垂直與線對稱", "三視圖"] },
      { no: 6, title: "統計圖表與資料分析", sections: ["統計圖表", "平均數、中位數與眾數"] },
    ],
  },
  {
    grade: 8,
    semester: "上",
    chapters: [
      {
        no: 1,
        title: "乘法公式與多項式",
        sections: ["乘法公式", "多項式的加減", "多項式的乘除"],
      },
      {
        no: 2,
        title: "二次方根與畢氏定理",
        sections: ["二次方根的意義", "根式的運算", "畢氏定理"],
      },
      {
        no: 3,
        title: "因式分解",
        sections: ["提公因式與分組分解", "利用乘法公式因式分解", "十字交乘法"],
      },
      {
        no: 4,
        title: "一元二次方程式",
        sections: ["因式分解解一元二次方程式", "配方法與公式解", "一元二次方程式的應用"],
      },
    ],
  },
  {
    grade: 8,
    semester: "下",
    chapters: [
      { no: 1, title: "數列與級數", sections: ["等差數列", "等差級數", "等比數列"] },
      { no: 2, title: "線型函數及其圖形", sections: ["函數與函數圖形", "線型函數的圖形"] },
      {
        no: 3,
        title: "三角形的基本性質",
        sections: ["三角形的內角與外角", "尺規作圖與三角形的全等", "全等三角形的性質", "三角形的邊角關係"],
      },
      {
        no: 4,
        title: "平行與四邊形",
        sections: ["平行線與截角性質", "平行四邊形", "特殊四邊形與梯形"],
      },
    ],
  },
  {
    grade: 9,
    semester: "上",
    chapters: [
      { no: 1, title: "相似形", sections: ["比例線段", "相似多邊形", "相似三角形的應用"] },
      {
        no: 2,
        title: "圓的性質",
        sections: ["點、直線與圓的關係", "圓心角、圓周角與弦切角"],
      },
      {
        no: 3,
        title: "幾何與證明",
        sections: ["推理證明", "三角形的外心", "三角形的內心", "三角形的重心"],
      },
    ],
  },
  {
    grade: 9,
    semester: "下",
    chapters: [
      { no: 1, title: "二次函數", sections: ["二次函數的圖形", "二次函數的最大值與最小值"] },
      { no: 2, title: "統計與機率", sections: ["四分位數與盒狀圖", "機率"] },
      { no: 3, title: "立體圖形", sections: ["角柱與圓柱", "角錐與圓錐"] },
    ],
  },
];

export type Topic = {
  grade: 7 | 8 | 9;
  semester: Semester;
  chapterNo: number;
  chapterTitle: string;
  sectionNo: number;
  sectionTitle: string;
};

// 由前端送來的索引找出單元，找不到回傳 null（避免任意文字被送進提示詞）
export function findTopic(
  grade: unknown,
  semester: unknown,
  chapterNo: unknown,
  sectionNo: unknown,
): Topic | null {
  const volume = CURRICULUM.find((v) => v.grade === grade && v.semester === semester);
  const chapter = volume?.chapters.find((c) => c.no === chapterNo);
  if (!volume || !chapter || typeof sectionNo !== "number") return null;
  const sectionTitle = chapter.sections[sectionNo - 1];
  if (!sectionTitle) return null;
  return {
    grade: volume.grade,
    semester: volume.semester,
    chapterNo: chapter.no,
    chapterTitle: chapter.title,
    sectionNo,
    sectionTitle,
  };
}

export function topicLabel(t: Topic) {
  return `${t.grade}${t.semester}・第 ${t.chapterNo} 章 ${t.chapterTitle}・${t.chapterNo}-${t.sectionNo} ${t.sectionTitle}`;
}
