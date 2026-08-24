export type ContactChannelKey = "github" | "instagram" | "email";

export type ContactChannel = {
  key: ContactChannelKey;
  href: string;
  label: string;
  handle: string;
  external: boolean;
};

// components/site-footer.tsx의 socialLinks와 같은 출처. 두 곳이 각자 데이터를
// 들고 있으면 언젠가 갈라지므로 여기 하나로 모으고 양쪽에서 import한다.
export const contactChannels: ContactChannel[] = [
  {
    key: "github",
    href: "https://github.com/hgkimdev",
    label: "GitHub",
    handle: "@hgkimdev",
    external: true,
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/hgkim_2/",
    label: "Instagram",
    handle: "@hgkim_2",
    external: true,
  },
  {
    key: "email",
    href: "mailto:hgkimdev@proton.me",
    label: "Email",
    handle: "hgkimdev@proton.me",
    external: false,
  },
];
