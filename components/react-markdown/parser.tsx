import { CONTENT_ANCHOR_CLASS_NAME, CONTENT_ANCHOR_PREFIX } from '@/libs/constants';
import { Schema } from 'hast-util-sanitize';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

/**
 * Parser of react-markdown.
 * This component can use both client and server side.
 */
export function Parser({
  children,
  className,
  addHeaderAnchor = false,
}: {
  children: string;
  className?: string;
  addHeaderAnchor?: boolean;
}) {
  const mySchema: Schema = { ...defaultSchema };

  const H1 = ({ node, ...props }: any) => (
    <h1
      {...props}
      id={`${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`}
      className={CONTENT_ANCHOR_CLASS_NAME}
    >
      {props.children}
    </h1>
  );
  const H2 = ({ node, ...props }: any) => (
    <h2
      {...props}
      id={`${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`}
      className={CONTENT_ANCHOR_CLASS_NAME}
    >
      {props.children}
    </h2>
  );

  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, mySchema]]}
      unwrapDisallowed={false}
      components={addHeaderAnchor ? { h1: H1, h2: H2 } : undefined}
    >
      {children}
    </ReactMarkdown>
  );
}
