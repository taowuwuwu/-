"""
SimpleRPC 协议定义模块
自定义协议格式：魔数 + 版本号 + 序列化方式 + 消息类型 + 数据长度 + 数据体
"""
import struct
from enum import IntEnum
from dataclasses import dataclass
from typing import Any, Optional

# 协议常量
MAGIC_NUMBER = 0x53525043  # "SRPC" 的十六进制表示
VERSION = 0x01
HEADER_LENGTH = 14  # 4+1+1+1+1+4+2 (魔数 + 版本 + 序列化 + 类型 + 保留 + 长度 + 请求 ID)


class SerializeType(IntEnum):
    """序列化类型枚举"""
    JSON = 0x01
    PROTOBUF = 0x02
    HESSIAN = 0x03
    MESSAGEPACK = 0x04


class MessageType(IntEnum):
    """消息类型枚举"""
    REQUEST = 0x01
    RESPONSE = 0x02
    HEARTBEAT_REQUEST = 0x03
    HEARTBEAT_RESPONSE = 0x04


@dataclass
class RpcMessage:
    """RPC 消息基类"""
    request_id: int
    serialize_type: SerializeType = SerializeType.JSON
    message_type: MessageType = None
    payload: Optional[Any] = None
    
    def to_bytes(self) -> bytes:
        """将消息序列化为字节流"""
        # TODO: 由具体子类实现
        pass
    
    @classmethod
    def from_bytes(cls, data: bytes) -> 'RpcMessage':
        """从字节流反序列化为消息"""
        # TODO: 由具体子类实现
        pass


@dataclass
class RpcRequest(RpcMessage):
    """RPC 请求消息"""
    service_name: str = ""
    method_name: str = ""
    parameter_types: list = None
    parameters: list = None
    
    def __post_init__(self):
        if self.parameter_types is None:
            self.parameter_types = []
        if self.parameters is None:
            self.parameters = []
        self.message_type = MessageType.REQUEST


@dataclass
class RpcResponse(RpcMessage):
    """RPC 响应消息"""
    result: Any = None
    error: Optional[str] = None
    success: bool = True
    
    def __post_init__(self):
        self.message_type = MessageType.RESPONSE
        if self.error:
            self.success = False


class ProtocolCodec:
    """协议编解码器 - 解决 TCP 粘包/半包问题"""
    
    @staticmethod
    def encode(message: RpcMessage) -> bytes:
        """
        编码方法：将 RPC 消息编码为字节流
        
        协议格式：
        +--------+--------+--------+--------+--------+--------+--------+
        |  Magic | Version| Serial |  Type  | Length | ReqID  |  Body  |
        |  4B    |  1B    |  1B    |  1B    |  4B    |  2B    |  N B   |
        +--------+--------+--------+--------+--------+--------+--------+
        """
        import json
        
        # 序列化 payload
        if isinstance(message, RpcRequest):
            payload_data = {
                'service_name': message.service_name,
                'method_name': message.method_name,
                'parameter_types': message.parameter_types,
                'parameters': message.parameters
            }
        elif isinstance(message, RpcResponse):
            payload_data = {
                'result': message.result,
                'error': message.error,
                'success': message.success
            }
        else:
            payload_data = message.payload
        
        # 使用 JSON 序列化 (可替换为 Protobuf/Hessian)
        payload_bytes = json.dumps(payload_data).encode('utf-8')
        payload_length = len(payload_bytes)
        
        # 构建消息头
        # 协议格式：魔数 (4B) + 版本号 (1B) + 序列化方式 (1B) + 消息类型 (1B) + 保留字节 (1B) + 数据长度 (4B) + 请求 ID(2B) = 14B
        header = struct.pack(
            '>IBBBBIH',  # 大端模式：4B+1B+1B+1B+1B+4B+2B = 14B
            MAGIC_NUMBER,
            VERSION,
            int(message.serialize_type),
            int(message.message_type),
            0,  # 保留字节
            payload_length,
            message.request_id & 0xFFFF
        )
        
        return header + payload_bytes
    
    @staticmethod
    def decode(data: bytes) -> RpcMessage:
        """
        解码方法：将字节流解码为 RPC 消息
        
        注意：此方法假设已处理完 TCP 粘包/半包问题
        实际使用中需要配合 LengthFieldBasedFrameDecoder
        """
        import json
        
        if len(data) < HEADER_LENGTH:
            raise ValueError(f"数据长度不足，期望至少{HEADER_LENGTH}字节，实际{len(data)}字节")
        
        # 解析消息头
        # 格式：魔数 (4B) + 版本 (1B) + 序列化 (1B) + 类型 (1B) + 保留 (1B) + 长度 (4B) + 请求 ID(2B)
        unpacked = struct.unpack('>IBBBBIH', data[:HEADER_LENGTH])
        magic = unpacked[0]
        version = unpacked[1]
        serial_type = unpacked[2]
        msg_type = unpacked[3]
        # unpacked[4] 是保留字节，跳过
        payload_length = unpacked[5]
        request_id = unpacked[6]
        
        # 验证魔数
        if magic != MAGIC_NUMBER:
            raise ValueError(f"无效的魔数：{hex(magic)}, 期望：{hex(MAGIC_NUMBER)}")
        
        # 验证版本
        if version != VERSION:
            raise ValueError(f"不支持的版本：{version}")
        
        # 提取 payload
        payload_bytes = data[HEADER_LENGTH:HEADER_LENGTH + payload_length]
        if len(payload_bytes) != payload_length:
            raise ValueError(f"payload 长度不匹配")
        
        # 反序列化 payload
        payload_data = json.loads(payload_bytes.decode('utf-8'))
        
        # 根据消息类型创建对应的消息对象
        serialize_type = SerializeType(serial_type)
        message_type = MessageType(msg_type)
        
        if message_type == MessageType.REQUEST:
            message = RpcRequest(
                request_id=request_id,
                message_type=message_type,
                serialize_type=serialize_type,
                service_name=payload_data.get('service_name', ''),
                method_name=payload_data.get('method_name', ''),
                parameter_types=payload_data.get('parameter_types', []),
                parameters=payload_data.get('parameters', [])
            )
        elif message_type == MessageType.RESPONSE:
            message = RpcResponse(
                request_id=request_id,
                message_type=message_type,
                serialize_type=serialize_type,
                result=payload_data.get('result'),
                error=payload_data.get('error'),
                success=payload_data.get('success', True)
            )
        else:
            message = RpcMessage(
                request_id=request_id,
                message_type=message_type,
                serialize_type=serialize_type,
                payload=payload_data
            )
        
        return message


class TcpFrameDecoder:
    """
    TCP 帧解码器 - 解决粘包/半包问题
    
    使用长度字段方式确定消息边界
    类似 Netty 的 LengthFieldBasedFrameDecoder
    """
    
    def __init__(self, max_frame_length: int = 10 * 1024 * 1024):
        self.max_frame_length = max_frame_length
        self.buffer = bytearray()
    
    def decode(self, data: bytes) -> list:
        """
        解码 TCP 数据流，返回完整的消息列表
        
        算法思路：
        1. 将新数据追加到缓冲区
        2. 检查是否有完整的消息头
        3. 如果有，读取消息长度
        4. 检查是否有完整的消息体
        5. 如果有，提取完整消息并继续检查下一条
        6. 如果数据不完整，等待下一次数据到达
        """
        messages = []
        self.buffer.extend(data)
        
        while len(self.buffer) >= HEADER_LENGTH:
            # 读取消息长度 (第 9-12 字节，0-indexed: [8:12])
            # 协议布局：Magic(0-3) + Ver(4) + Ser(5) + Type(6) + Res(7) + Length(8-11) + ReqID(12-13)
            payload_length = struct.unpack('>I', self.buffer[8:12])[0]
            frame_length = HEADER_LENGTH + payload_length
            
            # 检查帧长度是否超过最大值
            if frame_length > self.max_frame_length:
                raise ValueError(f"帧长度超过最大值：{frame_length}")
            
            # 检查是否有完整的数据
            if len(self.buffer) < frame_length:
                # 数据不完整，等待更多数据
                break
            
            # 提取完整消息
            frame_data = bytes(self.buffer[:frame_length])
            messages.append(frame_data)
            
            # 移除已处理的数据
            del self.buffer[:frame_length]
        
        return messages


# 使用示例
if __name__ == '__main__':
    # 创建请求消息
    request = RpcRequest(
        request_id=1,
        serialize_type=SerializeType.JSON,
        service_name='HelloService',
        method_name='sayHello',
        parameter_types=['java.lang.String'],
        parameters=['World']
    )
    
    # 编码
    encoded = ProtocolCodec.encode(request)
    print(f"编码后长度：{len(encoded)} 字节")
    print(f"编码后数据：{encoded.hex()}")
    
    # 模拟 TCP 粘包：将两条消息合并
    request2 = RpcResponse(
        request_id=1,
        serialize_type=SerializeType.JSON,
        result='Hello, World',
        success=True
    )
    encoded2 = ProtocolCodec.encode(request2)
    
    # 模拟粘包数据
    sticky_data = encoded + encoded2
    print(f"\n粘包数据总长度：{len(sticky_data)} 字节")
    
    # 使用解码器处理粘包
    decoder = TcpFrameDecoder()
    frames = decoder.decode(sticky_data)
    
    print(f"\n解码后消息数量：{len(frames)}")
    for i, frame in enumerate(frames):
        message = ProtocolCodec.decode(frame)
        print(f"消息{i+1}: {type(message).__name__}, ID={message.request_id}")
    
    # 模拟半包：只发送部分数据
    partial_data = sticky_data[:20]
    print(f"\n半包数据长度：{len(partial_data)} 字节")
    
    decoder2 = TcpFrameDecoder()
    frames_partial = decoder2.decode(partial_data)
    print(f"半包解码后消息数量：{len(frames_partial)} (应为 0)")
    
    # 发送剩余数据
    remaining_data = sticky_data[20:]
    frames_complete = decoder2.decode(remaining_data)
    print(f"补全后解码消息数量：{len(frames_complete)}")
