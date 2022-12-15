import type { ChildProcess } from 'child_process';
import kill from 'tree-kill';

export default async () =>
{
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const httpServerProcess = (globalThis.__SERVER__ as ChildProcess | undefined);

    if (httpServerProcess)
    {
        const processClose = new Promise<void>((resolve) =>
        {
            httpServerProcess.on('close', resolve);
        });

        kill(httpServerProcess.pid);
        await processClose;
    }
};
