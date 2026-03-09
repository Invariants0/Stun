import type { NodeTypes } from "reactflow";
import TextNode from "@/components/nodes/TextNode";
import ImageNode from "@/components/nodes/ImageNode";
import { MediaNode } from "@/components/nodes/MediaNode";

const NodeRenderer: NodeTypes = {
  text: TextNode,
  image: ImageNode,
  media: MediaNode,
};

export default NodeRenderer;
