<template>
  <div v-if="connectStatus === 'disconnected'">
    <div class="d-flex justify-content-center homeTitle">
      <h1>设备配对</h1>
    </div>
    <div class="d-flex justify-content-center my-4">
      <h4>选择并验证设备</h4>
    </div>
  </div>
  <div v-else>
    <div class="d-flex justify-content-center homeTitle">
      <h2 class="mb-5">正在连接
        <span class="fw-bold" style="font-size: 25px;color: #409EFF">{{ devicesName }}</span>
      </h2>
    </div>
  </div>
  <div class="d-flex justify-content-center">
    <el-card style="border-radius: 12px;">
      <div v-if="connectStatus === 'disconnected'" class="d-flex justify-content-center showConnectImg">
        <el-image :src="computerImg" class="computerImgCss" fit="contain"/>
        <SvgIcon :style="{marginTop: 30 + 'px'}" icon="usbIcon"/>
        <div class="horizontalLine"/>
        <SvgIcon :style="{marginTop: 30 + 'px'}" icon="typeIcon"/>
        <el-image :src="phoneImg" class="phoneImgCss" fit="contain"/>
      </div>
      <div v-else class="d-flex justify-content-center showConnectImg">
        <el-image :src="computerImg" class="computerImgCss" fit="contain"/>
        <div class="connectingCss">
          <!-- 使用循环生成元素 -->
          <div v-for="index in 3" :key="index" class="connecting-dot"></div>
        </div>
        <el-image :src="phoneImg" class="phoneImgCss" fit="contain"/>
      </div>
      <div v-if="connectStatus === 'disconnected'">
        <div class="d-flex justify-content-center">
          <span>使用USB线连接设备</span>
        </div>
        <div class="d-flex justify-content-center my-2">
          <span>然后在弹出窗口中连接</span>
        </div>
        <div class="d-flex justify-content-center my-4">
          <el-button type="primary" @click="connectDevice">连接设备</el-button>
        </div>
      </div>
      <div v-else-if="connectStatus === 'connectConfirming'">
        <div class="d-flex justify-content-center my-4">
          <span class="fw-bold">请在弹窗中选择需要连接的设备</span>
        </div>
      </div>
      <div v-else>
        <div class="d-flex justify-content-center my-4">
          <span class="fw-bold">请在设备上确认连接</span>
        </div>
      </div>
    </el-card>
  </div>

</template>
<script setup>
import computerImg from '@/assets/img/computer.png';
import phoneImg from '@/assets/img/phone.png';
import SvgIcon from '@/components/SvgIcon.vue';
import {AdbDaemonWebUsbDeviceManager} from "@yume-chan/adb-daemon-webusb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import {AdbDaemonTransport, Adb} from "@yume-chan/adb";
import {setAdbInstance} from "@/utils/adbManager.js";

const router = useRouter();

const connectStatus = ref('disconnected');
const devicesName = ref('')
let timerId;  // 定时器标识
const connectDevice = async () => {
  // 检查 WebUSB 支持
  if (!navigator.usb) {
    ElNotification.error({
      title: '浏览器不支持',
      message: '当前浏览器不支持 WebUSB API,请使用最新版 Chrome/Edge',
      duration: 5000
    });
    return;
  }

  // 检查管理器可用性
  if (!AdbDaemonWebUsbDeviceManager?.BROWSER?.requestDevice) {
    ElNotification.error({
      title: 'ADB 管理器未初始化',
      message: '请检查 adb 库是否正确加载',
      duration: 5000
    });
    return;
  }

  connectStatus.value = 'connecting'
  setTimeout(() => {
    changeColor()
  }, 100)

  const Manager = AdbDaemonWebUsbDeviceManager.BROWSER;
  connectStatus.value = 'connectConfirming'
  const device = await Manager.requestDevice()
  connectStatus.value = 'connected'
  if (device) {
    devicesName.value = device.name

    try {
      const connection = await device.connect();
      const CredentialStore = new AdbWebCredentialStore();
      const transport = await AdbDaemonTransport.authenticate({
        serial: device.serial,
        connection,
        credentialStore: CredentialStore,
      });
      const adb = new Adb(transport);
      console.log(adb)
      setAdbInstance(adb)
      // 路由跳转
      await router.push({
        name: "Overview",
      });
    } catch (e) {
      console.log(e)
      ElNotification.error({
        title: '连接失败',
        message: '连接失败，当前设备已被其他应用程序占用！请关闭其他程序再尝试连接',
        type: 'error',
        duration: 3000
      })
      connectStatus.value = 'disconnected'
    }
  } else {
    ElNotification.error({
      title: '连接失败',
      message: '连接失败，请检查设备是否已连接',
      type: 'error',
      duration: 3000
    })
    connectStatus.value = 'disconnected'
  }
}
// 控制指定div中每个元素的颜色，并随着时间变化
  const changeColor = () => {
    const div = document.querySelector('.connectingCss');
    const divs = div.children;
    let i = 0;

    // 清除旧的定时器
    clearInterval(timerId);

    timerId = setInterval(() => {
      divs[i] && (divs[i].style.backgroundColor = '#409EFF');
      if (i > 0) {
        divs[i - 1].style.backgroundColor = '#393a3c';
      } else {
        divs[divs.length - 1].style.backgroundColor = '#393a3c';
      }
      i++;
      if (i === divs.length) {
        i = 0;
      }
    }, 800);
  };
  onMounted(() => {
    localStorage.setItem('showHeader', 'false')
  })
// 离开页面时清除定时器
  onBeforeUnmount(() => {
    clearInterval(timerId);
    localStorage.setItem('showHeader', 'true')
  })
</script>
<style scoped>
.homeTitle {
  margin-top: 30px;
}

.showConnectImg {
  width: 400px;
  height: 150px
}

.computerImgCss {
  height: 100px;
  width: 100px
}

.horizontalLine {
  background-color: #a8a8a8;
  margin-top: 45px;
  margin-right: 4px;
  margin-left: 4px;
  flex-shrink: 0;
  height: 2px;
  width: 40px
}

.phoneImgCss {
  height: 80px;
  width: 80px;
  margin-top: 10px
}

.connectingCss {
  align-items: center;
  flex-direction: row;
  flex-shrink: 0;
  justify-content: center;
  column-gap: 20px;
  display: flex;
  width: 111px
}

.connecting-dot {
  background-color: #393a3c;
  border-radius: 50%;
  height: 13px;
  width: 13px;
  margin-bottom: 40px;
}

</style>