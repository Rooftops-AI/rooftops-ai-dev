"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Typography from "@tiptap/extension-typography"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconList,
  IconListNumbers,
  IconH1,
  IconH2,
  IconH3,
  IconQuote,
  IconCode,
  IconSeparator,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight
} from "@tabler/icons-react"
import { FC, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"

interface DocumentEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

export const DocumentEditor: FC<DocumentEditorProps> = ({
  content,
  onChange,
  editable = true
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder: "Start writing your document..."
      }),
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Link.configure({
        openOnClick: false
      })
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] p-4"
      }
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const MenuButton = ({
    onClick,
    active,
    disabled,
    children
  }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn("size-8 p-0", active && "bg-accent")}
      type="button"
    >
      {children}
    </Button>
  )

  return (
    <div className="flex h-full flex-col">
      {editable && (
        <>
          {/* Toolbar */}
          <div className="bg-background/95 border-b p-2">
            <div className="flex flex-wrap items-center gap-1">
              {/* Text formatting */}
              <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")}
              >
                <IconBold size={18} />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")}
              >
                <IconItalic size={18} />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive("strike")}
              >
                <IconStrikethrough size={18} />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                active={editor.isActive("code")}
              >
                <IconCode size={18} />
              </MenuButton>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Headings */}
              <MenuButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                active={editor.isActive("heading", { level: 1 })}
              >
                <IconH1 size={18} />
              </MenuButton>
              <MenuButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                active={editor.isActive("heading", { level: 2 })}
              >
                <IconH2 size={18} />
              </MenuButton>
              <MenuButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                active={editor.isActive("heading", { level: 3 })}
              >
                <IconH3 size={18} />
              </MenuButton>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Lists */}
              <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive("bulletList")}
              >
                <IconList size={18} />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive("orderedList")}
              >
                <IconListNumbers size={18} />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive("blockquote")}
              >
                <IconQuote size={18} />
              </MenuButton>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Alignment */}
              <MenuButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                active={editor.isActive({ textAlign: "left" })}
              >
                <IconAlignLeft size={18} />
              </MenuButton>
              <MenuButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                active={editor.isActive({ textAlign: "center" })}
              >
                <IconAlignCenter size={18} />
              </MenuButton>
              <MenuButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                active={editor.isActive({ textAlign: "right" })}
              >
                <IconAlignRight size={18} />
              </MenuButton>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Other */}
              <MenuButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
              >
                <IconSeparator size={18} />
              </MenuButton>
            </div>
          </div>
        </>
      )}

      {/* Editor content */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
