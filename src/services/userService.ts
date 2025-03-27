const names = ["푸른 용사", "노란 마법사", "초록 도적", "붉은 기사"];
const avatars = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=blue",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=yellow",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=green",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=red",
];

export function getUserProfile(id: number) {
  const index = id % 4;

  return {
    name: names[index],
    avatar: avatars[index],
  };
}
