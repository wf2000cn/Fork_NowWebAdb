import {AdbScrcpyClient} from "@yume-chan/adb-scrcpy";
import { InspectStream, ReadableStream } from '@yume-chan/stream-extra';

/**
 * 获取服务端二进制文件
 * @param {string} path 服务端文件路径
 * @returns {Promise<ArrayBuffer>} 返回服务端二进制文件的 ArrayBuffer
 */
export const fetchServerBinary = async (path) => {
    const serverUrl = new URL(path, import.meta.url);
    const response = await fetch(serverUrl);
    return await response.arrayBuffer();
};

/**
 * 将服务端文件推送到 ADB
 * @param adb ADB 实例
 * @param {ArrayBuffer} serverBuffer 服务端二进制文件的 ArrayBuffer
 * @param isScrcpy
 */
export const pushServerToAdb = async (adb, serverBuffer,destStr) => {
    await AdbScrcpyClient.pushServer(
        adb,
        new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array(serverBuffer));
                controller.close();
            },
        }),
        destStr
    );
};

/**
 * 整合 pushServerToAdb 和 startScrcpyClient
 * @param adb ADB 实例
 * @param {string} serverPath 服务端二进制文件的路径
 * @param isScrcpy
 */
export const pushServerAndStartScrcpyClient = async (adb, serverPath,isScrcpy=true) => {
    const serverBuffer = await fetchServerBinary(serverPath);
    console.log("传入参数名称:"+serverPath)
    var destStr = ""
    if(serverPath == "/server.bin"){
        destStr = "/data/local/tmp/scrcpy-server.jar"
    }else if(serverPath == "/apkans.jar"){
        destStr = "/data/local/tmp/apkans.jar"
    }else if(serverPath == "/ccAndroid"){
        destStr = "/data/local/tmp/ccAndroid"
    }
    console.log("推送文件目标地址:"+destStr)
    await pushServerToAdb(adb, serverBuffer, destStr);
};
