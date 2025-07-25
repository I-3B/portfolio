import { Badge } from "@/components/ui/badge";
import { IS_DEVELOPMENT } from "@/constants/flags";
import { readMdFile } from "@/utils/md";
import { getPublicPath, lookupPublicFile } from "@/utils/utils";
import { blogMatterSchema } from "@/validation/blog";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { readdirSync } from "fs";
import { Metadata } from "next";
import Link from "next/link";
dayjs.extend(advancedFormat);
export const metadata: Metadata = {
  title: "Blog | Islam Naasani",
  description:
    "My personal Blog, I write about problems I've faced or new things I've learned.",
};
export default async function Page() {
  const files = readdirSync(getPublicPath("content/blog"), "utf8");
  const parsed = (
    await Promise.all(
      files.map((file) =>
        readMdFile(
          lookupPublicFile(
            getPublicPath(`content/blog/${file.split(".")[0]}`),
            "mdx",
          ) ?? "",
          { frontmatterOnly: true },
        ),
      ),
    )
  )
    .map((md, i) => ({
      ...blogMatterSchema.parse(md.frontmatter),
      slug: files[i].split(".")[0],
    }))
    .filter((post) => post.draft !== true || IS_DEVELOPMENT)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="text-lg">
          {`My personal Blog, I write about problems I've faced or new things
          I've learned.`}
        </p>
        <ol className="mt-10 flex flex-col gap-5">
          {parsed.map((post, i) => (
            <li key={post.slug}>
              {i !== 0 && (
                <hr className="mb-5 h-1 rounded-lg border-none bg-foreground/5" />
              )}
              <Link href={`/blog/${post.slug}`}>
                <h2 className="mb-1 text-xl">
                  {post.title}
                  {post.draft && " (draft)"}
                </h2>
                <div className="flex items-center gap-2 text-gray-300">
                  <time
                    className="text-sm"
                    dateTime={dayjs(post.publishedAt).format("YYYY-MM-DD")}
                  >
                    {dayjs(post.publishedAt).format("MMM Do, YYYY")}
                  </time>
                  <span className="text-gray-400">•</span>
                  <ul className="flex items-center gap-0.5">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <li key={tag}>
                        <Badge variant="secondary">
                          {post.tags.length > 3 && i == 2
                            ? `+${post.tags.length - 2}`
                            : tag}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-2 text-muted-foreground">{post.summary}</p>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
