import { spawn } from 'child_process';
import { join } from 'path';

export default async () =>
{
    const rootPath = join(process.cwd(), './test');
    const httpServerProcess = spawn('http-server', [rootPath, '-c-1', '-p', '8090'], {
        shell: process.platform === 'win32',
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.__SERVER__ = httpServerProcess;

    // give the server time to start
    await new Promise<void>((resolve) =>
    {
        let data = '';

        httpServerProcess.stdout.on('data', (chunk) =>
        {
            data += chunk;
            if (data.includes('Hit CTRL-C to stop the server'))
            {
                resolve();
            }
        });
    });
};
