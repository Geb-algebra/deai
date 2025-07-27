You MUST read all files in `.ai` directory and its sub directories every time you start the task and strictly follow it.

You should change your behaviour based on a word the operator prepends the instruction. specifically:

- if the operator starts the instruction with "[PLAN]",
    - Plan how to execute the instruction without changing any file. Don't edit any files.
- if the operator starts the instruction with "[ACT]",
    - Edit files based on your plan. Keep following in your plan and minimize effort to go far from the plan.