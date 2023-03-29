import { Ast, FunctionAst } from '@/lib/ast';



export const getLastText = (node: Exclude<Ast, FunctionAst>) => {
  const text = node.text || "";
  const textTag = "\\text{";
  const textIndex = text.lastIndexOf(textTag);
  const textLength = text.substring(textIndex + textTag.length).indexOf("}");
  return text.substring(textIndex + textTag.length, textIndex + textTag.length + textLength);
}

const getAllTextTags = (body: FunctionAst["body"]): string => {
  return body.flatMap((node: Ast) => {
    if ("text" in node && node.text) {
      if ("body" in node) {
        return node.text + getAllTexts(node.body)
      }
      return node.text;
    }
    return "";
  }).join("")
}
const getAllTexts = (body: FunctionAst["body"]) => {
  return [...new Set<string>(
    Array.from(getAllTextTags(body).matchAll("\\\\text\{([^\}]*)\}" as any)).map((match: RegExpMatchArray) => match[1] as string)
  )];
}

export const getAllTextsExceptCurrent = (body: FunctionAst["body"], currentNode: Ast) => {
  return getAllTexts(body).filter(text => text !== getLastText(currentNode))
}

