/**
 * Korean (ko) Locale Dictionary
 */
export const ko = {
  header: {
    title: 'Tokyo Waterbus Atlas',
    subtitle: '도쿄 수상버스 공식 운항 상태·시간표 안내·선착장 탐색',
    languageBadge: '언어: 한국어'
  },
  tabs: {
    today: '오늘 상태',
    routes: '노선 목록',
    piers: '선착장',
    planner: '경로 계획',
    guide: '이용 가이드',
    explore: '탐색'
  },
  statusChip: {
    noSimulation: '● 현재 검증된 시뮬레이션이 없습니다',
    offlineDemoActive: '● 오프라인 데모 모드 (실시간 위치 아님)',
    startDemoBtn: '▶ 오프라인 데모 시작',
    stopDemoBtn: '⏹ 데모 중지',
    resetDemoBtn: '데모 리셋'
  },
  disclaimer: {
    bannerText: '오프라인 데모: GPS/AIS 미지원, 실시간 위치 미표시. 개략적 참고용이며 항해 안전용으로 사용할 수 없습니다.',
    understandDataLevels: '데이터 신뢰도 등급',
    close: '닫기 ×'
  },
  theme: {
    toggleBtn: '배경 지도: ',
    dark: '다크',
    light: '라이트',
    none: '없음 (참고자료)'
  },
  todayPanel: {
    title: '오늘의 운항 상태 및 공식 게이트웨이',
    badge: '공식 검증 링크',
    intro: '● 본 시스템은 공식 확인 게이트웨이를 제공하며 가상의 선박 위치를 생성하지 않습니다. 도쿄 수상버스 Atlas는 운항사의 최신 공식 상태 및 시간표로 안내합니다.',
    tokyoCruiseTitle: 'TOKYO CRUISE (도쿄 관광기선)',
    tokyoCruiseStatus: '정상 상태 (공식 확인 필요)',
    tokyoCruiseDesc: '스미다가와선, 아사쿠사-오다이바 직항선 등 정기 운항 상태는 아래 공식 링크에서 확인하세요.',
    tokyoCruiseAction: 'TOKYO CRUISE 오늘 운항 현황',
    tokyoCruiseTimetableAction: '공식 시간표 및 요금표',
    mizubeStatusLabel: '전편 운휴 중',
    checkBasis: '확인 근거: 공개 시간표 및 공식 고지 ｜ 확인 일시: 2026-08-02',
    mizubeAction: '도쿄 미즈베 라인 공식 고지 열기',
    footerDisclosure: 'This app tells me where to check today\'s official answer; it does not invent it.'
  },
  pierCard: {
    sectionTitle: '선착장 안내 카드',
    featuredBadge: '주요 선착장',
    whatUsefulFor: '이 선착장의 주요 용도:',
    addressLabel: '공식 위치 및 주소:',
    nearestTransitLabel: '인접 역 및 도보 소요 시간:',
    checklistTitle: '출발 전 필수 체크리스트:',
    checkItem1: '오늘의 공식 운항 상태 확인 (강풍·조류에 따라 당일 운휴 가능)',
    checkItem2: '최신 공식 시간표 및 요금 확인',
    checkItem3: '발권 및 승선 절차를 위해 최소 15분 전 도착 권장',
    actionPierPage: '공식 선착장 페이지 열기',
    actionTodayStatus: '오늘 운항 상태 확인',
    actionTimetable: '공식 시간표 보기',
    actionGoogleMaps: 'Google 지도에서 선착장 주변 열기',
    confidenceLabel: '위치 검증 및 사진 상태:',
    photoStatus: '현장 안내 사진: 준비 중',
    confidenceConfirmed: '공식 위치 확인됨',
    accessibilityTitle: '편의시설 및 배리어 프리:',
    facilitiesUnconfirmed: '배리어 프리 상세 정보는 현장 공식 안내를 확인하세요',
    missedFallbackTitle: '결항 또는 승선 미달 시 대처:',
    missedFallbackDesc: '공식 고지를 즉시 확인하고 필요 시 지하철 또는 JR 철도를 이용하세요.',
    provenanceTitle: '데이터 출처 및 검증 일시:',
    provenanceDesc: '출처: 운항사 공식 공지 ｜ 최종 검증: ',
    mizubeSuspensionTitle: '도쿄 미즈베 라인: 운항 중단',
    mizubeSuspensionBody: '2026년 1월 19일부터 운항이 중단되었습니다. 재개 일정은 공식 발표를 기다려 주세요. 현재 이 선착장에서 도쿄 미즈베 라인을 이용할 수 없습니다. 출발 전 공식 공지를 확인해 주세요.',
    mizubeSuspensionLink: '도쿄 미즈베 라인 공식 공지 열기',
    statusActive: '정상 운항',
    statusSuspended: '운항 중단',
    statusPartial: '부분 운항 (운휴 노선 포함)',
    statusVerify: '공식 확인 필요'
  },
  footer: {
    officialPortal: '운항사 공식 포털',
    lastValidated: '최종 검증:',
    secondaryReviewBtn: '데이터 품질 및 검증 (RGR)'
  },
  confidence: {
    officialConfirmed: '공식 확인됨',
    officialConfirmedDesc: '공식 공지 페이지 직접 링크.',
    timetableEstimate: '시각표 참고',
    timetableEstimateDesc: '공개 시각표 기준 참고 안내, 실시간 선박 위치가 아닙니다.',
    offlineStoryDemo: '오프라인 데모',
    offlineStoryDemoDesc: '수동 실행 개념 데모 애니메이션.',
    suspendedOrUnknown: '운휴 중 또는 미확인',
    suspendedOrUnknownDesc: '운휴 중 또는 미확인 데이터.'
  },
  provenance: {
    officialSourceLink: '공식 출처 페이지 ↗',
    publishedAt: '공식 발표 일시',
    checkedAt: '수동 검증 일시',
    fetchedAt: '자동 수집 일시',
    referenceOnly: '참고 데이터. 출발 전 운항사 공식 페이지를 확인하세요.',
    defaultLimitation: '실시간 GPS/AIS 추적이 아닙니다. 여행 참고 정보입니다.'
  },
  arrival: {
    title: '선착장 도착 안내',
    addressLabel: '주소',
    stationsLabel: '인근 역 및 도보 안내',
    officialBoardingLink: '공식 승선·안내 페이지 ↗',
    accessibilityPendingNotice: '배리어 프리·사진 안내: 공식 현장 검증 대기 (PENDING)',
    nonHinodePendingNotice: '이 선착장의 배리어 프리 상세 및 사진 안내는 공식 확인 전이므로 PENDING 상태입니다.'
  }
 };
