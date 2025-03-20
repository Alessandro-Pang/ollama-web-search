import { NextRequest, NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 获取会话的所有消息
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: '会话ID不能为空' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: '获取消息列表失败' }, { status: 500 });
  }
}

// 创建新消息
export async function POST(request: NextRequest) {
  try {
    const { content, role, sessionId } = await request.json();

    if (!sessionId || !content) {
      return NextResponse.json({ error: '会话ID和消息内容不能为空' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        role: role || 'user',
        sessionId,
      },
    });

    // 更新会话的更新时间
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: '创建消息失败' }, { status: 500 });
  }
}

// 更新消息
export async function PUT(request: NextRequest) {
  try {
    const { id, content } = await request.json();

    if (!id || !content) {
      return NextResponse.json({ error: '消息ID和内容不能为空' }, { status: 400 });
    }

    const message = await prisma.message.update({
      where: { id },
      data: { content },
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: '更新消息失败' }, { status: 500 });
  }
}

// 删除消息
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: '消息ID不能为空' }, { status: 400 });
    }

    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除消息失败' }, { status: 500 });
  }
}