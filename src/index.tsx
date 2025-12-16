import { createRoot } from "react-dom/client";
import ToDoList from './ToDoList';
import type { ReactNode } from "react";
import './style.css';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<ToDoList />);
