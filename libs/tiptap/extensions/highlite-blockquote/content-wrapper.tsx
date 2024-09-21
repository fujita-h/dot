import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';

export function EditorWrapper(props: NodeViewProps) {
  const { node, updateAttributes, extension } = props;
  const defaultType = node.attrs.type;
  return (
    <NodeViewWrapper className="highlight-blockquote relative">
      <select
        className="absolute top-2 right-2 text-sm px-2 py-1 text-gray-900 bg-white border rounded-md z-10"
        contentEditable={false}
        defaultValue={defaultType}
        onChange={(event) => updateAttributes({ type: event.target.value })}
      >
        <option value="null">none</option>
        <option disabled>—</option>
        {extension.options.types.map((type: string, index: number) => (
          <option key={index} value={type}>
            {type}
          </option>
        ))}
      </select>
      <blockquote className={`type-${defaultType}`}>
        <NodeViewContent />
      </blockquote>
    </NodeViewWrapper>
  );
}

export function ViewerWrapper(props: NodeViewProps) {
  const defaultType = props.node.attrs.type;
  return (
    <NodeViewWrapper className="highlight-blockquote relative">
      <blockquote className={`type-${defaultType}`}>
        <NodeViewContent />
      </blockquote>
    </NodeViewWrapper>
  );
}
