import { NextRequest, NextResponse } from 'next/server';
import {
  canReadProfile,
  canWriteProfile,
  isValidProfileId,
} from '@/lib/permissions';
import {
  readProfileFromStore,
  writeProfileToStore,
} from '@/lib/redis-server';
import {
  ActivityEntry,
  ApiPutPayload,
  ProfileId,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

function extractActorProfile(req: NextRequest): ProfileId | null {
  const headerVal = req.headers.get('x-profile')?.toLowerCase().trim();
  if (isValidProfileId(headerVal)) {
    return headerVal;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const targetId = context.params.id?.toLowerCase().trim();
  if (!isValidProfileId(targetId)) {
    return NextResponse.json(
      { error: 'Invalid profile identifier.' },
      { status: 400 }
    );
  }

  const actorId = extractActorProfile(req);
  if (!actorId) {
    return NextResponse.json(
      { error: 'Missing or invalid x-profile header.' },
      { status: 401 }
    );
  }

  // Enforce server-side permission check
  if (!canReadProfile(actorId, targetId)) {
    return NextResponse.json(
      { error: 'Forbidden: Members can only access their own profile.' },
      { status: 403 }
    );
  }

  const { profile, activity, storageMode } = await readProfileFromStore(targetId);

  // Only Master (Visal) receives the full activity log
  const filteredActivity =
    actorId === 'visal'
      ? activity
      : activity.filter((entry) => entry.subject === actorId);

  return NextResponse.json({
    profile,
    activity: filteredActivity,
    storageMode,
    serverTime: new Date().toISOString(),
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const targetId = context.params.id?.toLowerCase().trim();
  if (!isValidProfileId(targetId)) {
    return NextResponse.json(
      { error: 'Invalid profile identifier.' },
      { status: 400 }
    );
  }

  const actorId = extractActorProfile(req);
  if (!actorId) {
    return NextResponse.json(
      { error: 'Missing or invalid x-profile header.' },
      { status: 401 }
    );
  }

  // Enforce server-side write permissions
  if (!canWriteProfile(actorId, targetId)) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to modify this profile.' },
      { status: 403 }
    );
  }

  let body: ApiPutPayload;
  try {
    body = (await req.json()) as ApiPutPayload;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload.' },
      { status: 400 }
    );
  }

  if (!body || !body.profile) {
    return NextResponse.json(
      { error: 'Missing profile object in request body.' },
      { status: 400 }
    );
  }

  const nowISO = new Date().toISOString();
  const updatedProfile = { ...body.profile };

  // If Visal edits Pooja's profile, stamp lastVisitor so Pooja's pet reacts with "Visal's here 👋"
  if (actorId === 'visal' && targetId === 'pooja') {
    updatedProfile.settings = {
      ...updatedProfile.settings,
      lastVisitor: {
        actor: 'visal',
        at: nowISO,
      },
    };
  }

  let newActivity: ActivityEntry | undefined;
  if (body.activityText && body.activityText.trim().length > 0) {
    newActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actor: actorId,
      subject: targetId,
      text: body.activityText.trim(),
      at: nowISO,
    };
  }

  const { profile, activity, storageMode } = await writeProfileToStore(
    targetId,
    updatedProfile,
    newActivity
  );

  const filteredActivity =
    actorId === 'visal'
      ? activity
      : activity.filter((entry) => entry.subject === actorId);

  return NextResponse.json({
    profile,
    activity: filteredActivity,
    storageMode,
    serverTime: nowISO,
  });
}
