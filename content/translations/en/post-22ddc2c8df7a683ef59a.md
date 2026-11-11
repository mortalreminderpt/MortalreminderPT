---
title: React Hook (Part 6) — useReducer
description: ''
---

1. Table of Contents
{:toc}

## Purpose

`useReducer` is a Hook provided by React for introducing a Reducer (similar to the Reducer in Redux) into function components to manage complex state logic inside a component. Compared with `useState`, `useReducer` is better suited for handling complex state that involves multiple sub-values, or when the next state depends on the previous state.

**Example:**

```jsx
import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    default:
      throw new Error('Unknown action type');
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <>
      <button onClick={() => dispatch({ type: 'increment' })}>
        增加
      </button>
      <p>当前计数：{state.count}</p>
    </>
  );
}
```

In this example, `useReducer` accepts a Reducer function and an initial state, and returns the current state and the `dispatch` function. By calling `dispatch`, a state update can be triggered.

## Notes

### 1. The Reducer function must be a pure function

The Reducer function should be a pure function that receives the current `state` and `action` and returns the new state. It should not produce side effects, and it should not directly modify the passed-in `state`; instead, it should return a new state object.

**Incorrect example:**

```jsx
function reducer(state, action) {
  // ❌ 不要直接修改 state
  state.count += 1;
  return state;
}
```

**Correct example:**

```jsx
function reducer(state, action) {
  // ✅ 返回新的状态对象
  return { count: state.count + 1 };
}
```

### 2. Initializing state

The second argument of `useReducer` is the initial state. You can pass the initial state value directly, or provide a lazy initialization function through the third argument `init` to avoid recomputing the initial state.

**Example:**

```jsx
function init(initialCount) {
  return { count: initialCount };
}

function Counter({ initialCount }) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  // ...
}
```

### 3. The `dispatch` function does not update state immediately

After calling `dispatch`, the state update takes effect only on the next render. If you read the state immediately after calling `dispatch`, you will still get the state value from before the update.

**Example:**

```jsx
function handleClick() {
  dispatch({ type: 'increment' });
  console.log(state.count); // 可能还是旧的 count 值
}
```

### 4. Avoid calling `dispatch` during rendering

Calling `dispatch` during the rendering process will cause an error, producing a "Too many re-renders" error. `dispatch` should be called in event handlers or side effects.

**Incorrect example:**

```jsx
function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  // ❌ 不要在渲染期间调用 dispatch
  dispatch({ type: 'increment' });
  return <div>{state.count}</div>;
}
```

## What you can do

- **Manage complex state logic**: When the state logic is relatively complex, contains multiple sub-values, or the next state depends on the previous state, using `useReducer` can make the code clearer.

- **Centralize state update logic in the Reducer**: You can centralize all state update logic in the Reducer function, making it easier to manage and test.

- **Optimize performance**: In some cases, `useReducer` can prevent unnecessary re-renders of child components caused by callback functions being recreated.

- **Use lazy initialization**: By providing the `init` function, you can avoid expensive computations during the initial render.

**Example:**

```jsx
function init(initialValue) {
  return { value: initialValue };
}

function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return init(action.payload);
    // ...
  }
}

const [state, dispatch] = useReducer(reducer, initialValue, init);
```

## What you should not do

- **Do not modify state directly**: The Reducer function must return a new state object and must not directly modify the passed-in `state`.

- **Do not perform side effects in the Reducer**: The Reducer should be a pure function, and side-effect operations such as network requests and logging should not be performed in it.

- **Do not redefine the Reducer function inside the component**: Avoid recreating the Reducer function on every render inside the component; you can define it outside the component or use `useCallback`.

- **Do not call `dispatch` during rendering**: This will cause an infinite render loop; `dispatch` should be called in event handlers or `useEffect`.

## Summary

`useReducer` is a powerful Hook, suitable for scenarios that manage complex state logic. By using a Reducer, we can centrally manage state update logic, making components easier to maintain and test. When using `useReducer`, you need to pay attention to the following points:

- **The Reducer must be a pure function**: Do not modify state directly, and do not perform side effects in it.

- **Initialize state correctly**: Use an initial value or a lazy initialization function as needed.

- **Understand how `dispatch` works**: State updates are asynchronous; after calling `dispatch`, the state is updated only on the next render.

- **Follow the rules for using Hooks**: Do not use `useReducer` in loops, conditions, or nested functions, and do not call `dispatch` during rendering.

By using `useReducer` appropriately, we can better manage component state logic and write React applications with better performance and clearer structure.
