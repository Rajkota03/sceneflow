import { Project, ScriptContent } from "./types";
import { generateUniqueId } from "./formatScript";

// Create a basic empty script content with a single scene heading
export const emptyContent: ScriptContent = {
  elements: [
    {
      id: generateUniqueId(),
      type: "scene-heading",
      text: "INT. SOMEWHERE - DAY"
    },
    {
      id: generateUniqueId(),
      type: "action",
      text: "Type your action here..."
    }
  ]
};

// Create an empty project template
export const emptyProject: Project = {
  id: "empty",
  title: "Untitled Screenplay",
  createdAt: new Date(),
  updatedAt: new Date(),
  content: emptyContent
};
