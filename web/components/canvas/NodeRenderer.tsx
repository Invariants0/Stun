import type { NodeTypes } from "reactflow";
import TextNode from "@/components/nodes/TextNode";
import ImageNode from "@/components/nodes/ImageNode";

const NodeRenderer: NodeTypes = {
  text: TextNode,
  image: ImageNode,
};

export default NodeRenderer;
