const names = [
  "푸른 용사",
  "노란 마법사",
  "초록 도적",
  "붉은 기사",
  "검은 궁수",
  "하얀 사제",
  "회색 닌자",
  "황금 상인",
  "은빛 방랑자",
  "분홍 학자",
  "민트 요정",
  "남색 기병",
];

export function getUserProfile(uid: string) {
  const index =
    Array.from(uid).reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    names.length;
  const name = names[index];

  const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(uid)}`;

  return {
    name,
    avatar,
  };
}
