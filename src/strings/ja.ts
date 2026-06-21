// 日本語文言の一元管理。煽らない・止めない・整理するトーン。
// 赤字エラー・破綻/危険/不足/対策必須などの語は使わない。

import { ASSUMPTION_SOURCES } from '../lib/educationAssumptions';

export const ja = {
  app: {
    title: '教育費ピークシミュレーター',
  },

  intro: {
    title: '教育費ピークシミュレーター',
    description:
      '子どもの年齢と進学方針から、\n教育費が大きくなる時期と親の年齢を整理します。',
    note: '教育費の総額だけでなく、\nどの年に負担が重なるかを見るための簡易試算です。',
    cta: '教育費の流れを見てみる',
    resume: {
      title: '前回の入力内容から再開できます',
      resumeButton: '前回の内容から再開する',
      freshButton: '新しく入力する',
    },
  },

  input: {
    heading: '条件を入力する',
    lead: '分かる範囲で大丈夫です。あとから変えて、何度でも再計算できます。',
    ageNote: 'いずれも年齢ベースの概算です。',
    parentAge: {
      label: '親の現在年齢',
      unit: '歳',
      help: '教育費ピーク時の親年齢の目安に使います（20〜70歳）。',
    },
    baselineYear: {
      label: '基準年',
      unit: '年',
      help: '何年後かを年に置き換えて表示するための基準です。通常は今年のままで大丈夫です。',
    },
    child: {
      legend: (n: number) => `第${n}子`,
      currentAge: {
        label: '現在年齢',
        unit: '歳',
        help: '現在の年齢です（0〜22歳）。これから先の教育費だけを試算します。',
      },
      jhhs: {
        label: '中学・高校の進学方針',
        options: {
          public: '公立中心',
          publicToPrivateHigh: '公立中学校 → 私立高校',
          privateIntegrated: '私立中高一貫',
        },
        descriptions: {
          public: '中学・高校とも公立を想定します。',
          publicToPrivateHigh: '中学は公立、高校から私立を想定します。',
          privateIntegrated:
            '中高一貫の私立を想定します（計算上は私立中学・私立高校の年額を使います）。',
        },
      },
      university: {
        label: '大学進学',
        options: {
          none: '進学しない',
          nationalPublic: '国公立大学',
          private: '私立大学',
        },
      },
      living: {
        label: '通学形態',
        options: {
          home: '自宅通学',
          away: '下宿・一人暮らし',
        },
        disabledNote: '大学進学を選ぶと選べます。',
      },
      addLabel: '子どもを追加する',
      removeLabel: (n: number) => `第${n}子を削除する`,
    },
    seeResult: '教育費の流れを見る',
  },

  result: {
    heading: '教育費の流れ',
    peak: {
      title: '教育費のピーク',
      yearSuffix: '年',
      annualLabel: '年間',
      parentPrefix: '親',
    },
    total: {
      title: '今後の教育費総額（概算）',
      note: '過去にかかった費用は含みません。現在から先の概算総額です。',
    },
    childPeaks: {
      title: '子ども別の教育費ピーク',
      childLabel: (n: number) => `第${n}子のピーク`,
      annualLabel: '年間教育費',
      stageLabel: '主な教育段階',
      parentLabel: '親年齢',
      none: 'この子の今後の教育費は試算範囲にありません。',
    },
    chart: {
      title: '家族全体の年次推移',
      axisYearShort: (offset: number) => (offset === 0 ? '今年' : `${offset}年後`),
      peakBadge: 'ピーク',
      universityStartNote: '大学進学が始まる年は費用が大きくなりやすい時期です。',
      empty: '表示できる年次の教育費がありません。',
      tableToggle: '年次一覧を見る',
      tableYear: '年',
      tableParentAge: '親年齢',
      tableTotal: '年間教育費',
    },
    overlap: {
      title: '教育費が重なりやすい時期',
      body: (start: number, end: number) =>
        start === end
          ? `${start}年ごろは、複数のお子さんの教育費が重なりやすい時期です。`
          : `${start}〜${end}年ごろは、複数のお子さんの教育費が重なりやすい時期です。`,
    },
    disclaimer:
      'この試算は、一般的な進学パターンに基づく概算です。実際の学費・塾代・受験費用・仕送り・留学費用などは家庭や学校によって異なります。',
    assumptions: {
      toggle: '計算前提を見る',
      ageBased: 'すべて年齢ベースの概算で、現在の金額をもとにしています（インフレ・運用は考慮しません）。',
      model:
        '小学校・中学校・高校は学習費総額、大学は授業料・入学料・施設設備費をもとにしています。',
      universityFirstYear:
        '私立大学は、初年度に学生納付金の平均額（授業料・入学料・施設設備費）を計上し、2〜4年目は授業料と施設設備費を用いた概算です。学部、実験実習費、大学ごとの費用などにより実際の金額は異なります。',
      away:
        '下宿・一人暮らしの費用は、通常の生活費との重複を避けるため、自宅外通学による追加負担（住居・光熱費相当）のみを概算で上乗せしています。',
      excluded:
        '塾・習い事・受験対策費、医学部・留学・浪人、奨学金・教育ローン、私立小学校などは含みません。',
      variance:
        '実際の費用は、学校・地域・世帯の方針、受験や仕送りの有無などによって差が出ます。',
      sourcesTitle: '出典',
      sources: [
        `小・中・高：${ASSUMPTION_SOURCES.k12}`,
        `国公立大学：${ASSUMPTION_SOURCES.nationalUniversity}`,
        `私立大学：${ASSUMPTION_SOURCES.privateUniversity}`,
        `自宅外通学の追加費用：${ASSUMPTION_SOURCES.away}`,
        ASSUMPTION_SOURCES.surveyFiscalYear,
        `最終更新日：${ASSUMPTION_SOURCES.updatedAt}`,
      ],
    },
    handoff: {
      title: '生活設計に反映する',
      lead:
        'ここで整理した教育費条件を、住宅ローンや生活費・働き方と重ねて確認できます。',
      reflectButton: 'この教育費条件を生活設計に反映する',
      reflectedNote: '生活設計に反映する教育費条件として保存しました',
      gotoButton: '人生全体の資産推移で見る',
    },
    backToInput: '条件を変えて再計算する',
  },

  stage: {
    none: '—',
    elementary: '小学校',
    juniorHigh: '公立中学校',
    juniorHighPrivate: '私立中学校',
    highSchool: '公立高校',
    highSchoolPrivate: '私立高校',
    universityNational: '国公立大学',
    universityPrivate: '私立大学',
  },
} as const;

export type StageKey = keyof typeof ja.stage;
