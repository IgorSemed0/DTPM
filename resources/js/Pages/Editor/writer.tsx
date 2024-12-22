import { useState, useRef } from 'react';
import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const BlogEditor = () => {
  const [content, setContent] = useState('# New Blog Post\n\nStart writing here...');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const editorRef = useRef<MDXEditorMethods>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const markdown = editorRef.current?.getMarkdown() || '';

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          content: markdown,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      // Show success message
      alert('Post saved successfully!');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Post Title"
            className="flex-1 p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="URL Slug"
            className="flex-1 p-2 border rounded"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <button
            className={`px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 p-4 overflow-auto border-r">
          <MDXEditor
            ref={editorRef}
            markdown={content}
            onChange={setContent}
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              linkPlugin(),
              imagePlugin(),
              tablePlugin(),
              codeBlockPlugin()
            ]}
            className="h-full"
          />
        </div>

        <div className="w-1/2 p-4 overflow-auto bg-gray-50">
          <div className="prose max-w-none">
            {/* You'll need to implement MDX preview rendering here */}
            <pre className="whitespace-pre-wrap">{content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
