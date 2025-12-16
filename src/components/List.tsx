export * from "../ToDoList";
//
/*
export default function List(
  {toDoList, status, statusDisplayName, nextStatus}
  : {toDoList: ToDo[], status: TodoStatus, statusDisplayName: string, nextStatus: TodoStatus}
) {
  return (
    <div className={`list ${status}`}>
      <h3>{statusDisplayName}</h3>
      <ul className="ul">
          {toDoList.map((toDo: any) => (
              <li key={toDo.id} className="li">
                  <div className="row-container list-item">
                      <button onClick={() => updateStatus(toDo.id, nextStatus)} className="list-item-button">{statusDisplayName}</button>
                      <span className="list-item-title">{toDo.title}</span>
                      <span className="list-item-deadline">{toDo.deadline}</span>
                      <span className="list-item-description">{toDo.description || " "}</span>
                  </div>
              </li>
          ))}  
      </ul>
    </div>
    );
}
    */
