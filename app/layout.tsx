import type { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import "./globals.scss";

export const metadata: Metadata = {
  title: "雷霆战机 - 红色教育游戏",
  description: "结合反法西斯胜利和中华民族伟大复兴主题的飞行射击游戏",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
