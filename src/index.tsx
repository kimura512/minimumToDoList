import { createRoot } from "react-dom/client";
import ToDoList from './ToDoList';
import type { ReactNode } from "react";

//const n: number = "a";
const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<ToDoList />);
