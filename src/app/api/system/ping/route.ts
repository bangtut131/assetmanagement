import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Memastikan route ini selalu dieksekusi secara dinamis di server, tidak di-cache statis
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Lakukan query ringan murni ke Supabase untuk menjaga koneksi aktif
        // Query ke tabel 'locations' limit 1, hanya mengambil 'id' agar transfer data sangat kecil
        const { data, error } = await supabase
            .from('locations')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Ping query error:', error);
            throw error;
        }

        return NextResponse.json({
            status: 'success',
            message: 'Database ping successful. Supabase will not be paused.',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Database ping failed:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Database ping failed',
                error: error.message
            },
            { status: 500 }
        );
    }
}
