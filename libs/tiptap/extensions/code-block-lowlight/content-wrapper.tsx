import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';

export function EditorWrapper(props: NodeViewProps) {
  const { node, updateAttributes, extension } = props;
  const defaultLanguage = node.attrs.language;
  return (
    <NodeViewWrapper className="code-block relative">
      <select
        className="absolute top-2 right-2 text-sm px-2 py-1 text-gray-900 bg-white border rounded-md"
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={(event) => updateAttributes({ language: event.target.value })}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {extension.options.lowlight.listLanguages().map((lang: string, index: number) => (
          <option key={index} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

export function ViewerWrapper(props: NodeViewProps) {
  const defaultLanguage = props.node.attrs.language;
  return (
    <NodeViewWrapper className="code-block relative">
      <div className="absolute top-1 right-1 text-xs px-2 py-0.5 text-gray-900 bg-white border border-gray-300 rounded-md">
        {defaultLanguage}
      </div>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
