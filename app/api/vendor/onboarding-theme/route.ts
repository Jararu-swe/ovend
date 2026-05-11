import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import { getTemplateById } from '@/app/lib/template-presets';
import { getOrCreateVendorTheme, ensureNewColumns } from '@/app/lib/theme';
import { sql } from '@/app/lib/db';

const Schema = z.object({
  template_id: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user?.id || role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid template selection' }, { status: 400 });
    }

    const template = getTemplateById(parsed.data.template_id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await ensureNewColumns();
    await getOrCreateVendorTheme(session.user.id);

    const theme = template.theme as any;
    const sections = JSON.stringify(template.sections ?? []);
    const section_content = JSON.stringify(template.sectionContent ?? {});

    await sql`
      UPDATE store_theme
      SET
        template_id = ${template.id},
        primary_color = ${theme.primary_color},
        secondary_color = ${theme.secondary_color},
        background_color = ${theme.background_color},
        text_color = ${theme.text_color},
        accent_color = ${theme.accent_color},
        surface_color = ${theme.surface_color ?? '#ffffff'},
        heading_color = ${theme.heading_color ?? '#0f172a'},
        border_color = ${theme.border_color ?? '#e2e8f0'},
        font_family = ${theme.font_family},
        heading_font = ${theme.heading_font},
        font_size = ${theme.font_size},
        layout_style = ${theme.layout_style},
        card_style = ${theme.card_style},
        border_radius = ${theme.border_radius},
        card_shadow = ${theme.card_shadow ?? 'soft'},
        button_style = ${theme.button_style ?? 'solid'},
        button_radius = ${theme.button_radius ?? 'rounded'},
        animation_style = ${theme.animation_style ?? 'fade'},
        header_style = ${theme.header_style},
        show_product_images = ${true},
        image_aspect_ratio = ${theme.image_aspect_ratio},
        show_product_description = ${true},
        spacing = ${theme.spacing},
        primary_gradient = ${theme.primary_gradient ?? null},
        glass_effect = ${theme.glass_effect ?? false},
        layout_width = ${theme.layout_width ?? 'wide'},
        show_mobile_checkout_bar = ${theme.show_mobile_checkout_bar ?? false},
        show_logo = ${true},
        logo_position = ${theme.logo_position ?? 'left'},
        logo_frame = ${theme.logo_frame ?? 'profile'},
        icon_library = ${theme.icon_library ?? 'heroicons'},
        icon_fill = ${theme.icon_fill ?? 'outline'},
        icon_weight = ${theme.icon_weight ?? 'regular'},
        cart_icon = ${theme.cart_icon ?? 'shopping-bag'},
        user_icon = ${theme.user_icon ?? 'user'},
        share_icon = ${theme.share_icon ?? 'arrow-square'},
        add_icon = ${theme.add_icon ?? 'plus'},
        sections = ${sections},
        section_content = ${section_content},
        draft_config = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE vendor_id = ${session.user.id}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Onboarding theme update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

