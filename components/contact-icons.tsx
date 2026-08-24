import type { ReactNode } from "react";
import { Mail } from "lucide-react";
import { SiGithub, SiInstagram } from "@icons-pack/react-simple-icons";

import type { ContactChannelKey } from "@/content/contact";

type ContactIcon = (props: { size?: number; color?: string }) => ReactNode;

export const contactIcons: Record<ContactChannelKey, ContactIcon> = {
  github: SiGithub,
  instagram: SiInstagram,
  email: Mail,
};
