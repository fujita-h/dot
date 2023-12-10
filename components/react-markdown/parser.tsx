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
export function Parser({ children, className }: { children: string; className?: string }) {
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
  const A = ({ node, ...props }: any) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  );
  const Img = ({ node, ...props }: any) => (
    <a href={props.src} target="_blank" rel="noopener noreferrer">
      <img {...props} alt={props.alt} />
    </a>
  );

  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, mySchema]]}
      unwrapDisallowed={false}
      components={{ h1: H1, h2: H2, a: A, img: Img }}
    >
      {children}
    </ReactMarkdown>
  );
}
