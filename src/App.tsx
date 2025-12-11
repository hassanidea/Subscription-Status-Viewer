import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => {
        setTodos([...data.items]);
        setIsLoading(false);
      },
    });
    return () => subscription.unsubscribe();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content });
    }
  }

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>My todos</h1>
        <div>
          <span style={{ marginRight: "15px" }}>
            Welcome, {user?.signInDetails?.loginId}
          </span>
          <button onClick={signOut}>Sign Out</button>
        </div>
      </div>
      <button onClick={createTodo}>+ new</button>

      {isLoading ? (
        <p>Loading your todos...</p>
      ) : todos.length === 0 ? (
        <p>No todos yet. Create one!</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.content}</li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
