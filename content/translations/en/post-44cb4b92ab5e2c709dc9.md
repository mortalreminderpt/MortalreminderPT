---
title: React Design Philosophy (Part 1) — Components and Hooks must be pure
description: ''
---

1. Table of Contents
{:toc}

### Components and Hooks must remain pure:

1. **Idempotency**: Components and Hooks should be idempotent, that is, given the same inputs (such as `props`, `state`, and `context`), they always produce the same output. Functions like `new Date()` or `Math.random()` cannot be used during rendering because they generate a different result every time.

2. **No side effects**: Rendering should not produce side effects (that is, it should not affect the outside world). React renders components multiple times to optimize the user experience, so side effects (such as DOM operations and data fetching) should be performed in `useEffect` or event handlers, not during rendering.

3. **Immutable Props and State**: `props` and `state` are immutable snapshots in React. Do not modify them directly; instead, update `state` by passing new `props` or using the setter function provided by `useState`.

4. **Local mutation is acceptable**: Although global mutation or mutations that affect other components are not allowed, local mutations inside a component are acceptable. For example, creating local variables during rendering and modifying them is fine, because these variables only exist within the current component lifecycle and do not affect subsequent renders.

5. **Lazy initialization**: Provided it does not affect other components, lazy initialization can be performed, for example by calling certain external functions to initialize data, as long as these functions do not cause side effects during rendering.

6. **Avoid modifying values after they are used in JSX**: Once a value used in a JSX expression has been passed, React may have already rendered that part of the UI in advance, so do not modify these values after the JSX has been created.

### DO

1. **Local Mutation**:
   - **Variables can be mutated locally**, as long as these variables are created inside the component. For example, during rendering you can create a local array and add elements to it, because these variables are not retained on the next render.
   - Example:
     ```js
     function FriendList({ friends }) {
       const items = [];
       for (let friend of friends) {
         items.push(<Friend key={friend.id} friend={friend} />);
       }
       return <ul>{items}</ul>;
     }
     ```

2. **Run side effects in `useEffect`**:
   - **Side effects can be performed in `useEffect`**, such as data fetching, subscriptions, or modifying the DOM; these operations should be performed after rendering is complete, not during rendering.
   - Example:
     ```js
     useEffect(() => {
       document.title = `Clicked ${count} times`;
     }, [count]);
     ```

3. **Operations in event handlers**:
   - **State updates or other operations can be performed in event handlers**, because these operations are only triggered by user interaction and do not affect the purity of the rendering process.
   - Example:
     ```js
     function handleClick() {
       setCount(count + 1);
     }
     ```

4. **Lazy initialization**:
   - **Lazy initialization can be used**, such as calling certain initialization functions inside a component, as long as these operations do not affect other components or global state.
   - Example:
     ```js
     SuperCalculator.initializeIfNotReady(); // 只要它不会影响其他地方
     ```

5. **Initialize state with `useState`**:
   - A component's state can be initialized via `useState`; this operation is executed only once, on the component's first render.
   - Example:
     ```js
     const [time, setTime] = useState(() => new Date());
     ```

### DONT DO

1. **Perform side effects during rendering**:
   - **Do not perform side effects in the render function**, such as modifying global variables, making network requests, or modifying the DOM, because the render function may be called multiple times.
   - Incorrect example:
     ```js
     function ProductDetail({ product }) {
       document.title = product.name; // ❌ 错误：不应该在渲染中修改 DOM
     }
     ```

2. **Modify `props` or `state`**:
   - **Do not modify `props` or `state` directly**, because they are immutable. If you modify them directly, React will not be able to know about these changes, causing the UI not to update.
   - Incorrect example:
     ```js
     function Counter() {
       let count = 0;
       count = count + 1; // ❌ 错误：直接修改状态变量
     }
     ```

3. **Modify non-local variables**:
   - **Do not modify variables created outside the component**, because these variables retain their previous values when the component re-renders, leading to unexpected behavior.
   - Incorrect example:
     ```js
     const items = []; // ❌ 错误：在组件外部创建
     function FriendList({ friends }) {
       for (let friend of friends) {
         items.push(<Friend key={friend.id} friend={friend} />);
       }
       return <ul>{items}</ul>;
     }
     ```

4. **Use non-idempotent functions (such as `new Date()` and `Math.random()`)**:
   - **Do not use non-idempotent functions during rendering**, such as `new Date()` or `Math.random()`, because the value they return differs on each call, which breaks the component's idempotency.
   - Incorrect example:
     ```js
     function Clock() {
       const time = new Date(); // ❌ 错误：每次渲染都会得到不同的结果
       return <div>{time.toLocaleTimeString()}</div>;
     }
     ```

5. **Modify values after they are passed to JSX**:
   - **Do not modify values related to JSX after the JSX has been created**, because React may compute the JSX in advance and will not track subsequent value changes.
   - Incorrect example:
     ```js
     function Page({ color }) {
       const styles = { color, size: 'large' };
       const header = <Header styles={styles} />;
       styles.size = 'small'; // ❌ 错误：在 JSX 创建后修改 styles
       return (
         <>
           {header}
           <Footer styles={styles} />
         </>
       );
     }
     ```

### Summary

- **What you can do**: local mutation, use `useEffect` to perform side effects, perform operations in event handlers, use lazy initialization and `useState`.
- **What you must not do**: perform side effects during rendering, directly modify `props` or `state`, modify non-local variables, use non-idempotent functions, and modify values after JSX has been created.
