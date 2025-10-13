<?php

namespace Database\Seeders;

use App\Models\Stage;
use App\Models\StageItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StagesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('stage_items')->truncate();
        DB::table('stages')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create stages
        $stages = [
            [
                'name' => 'Setup',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Business Formation',
                'created_at' => now()->addDay(),
                'updated_at' => now()->addDay(),
            ],
            [
                'name' => 'Finalization',
                'created_at' => now()->addDays(2),
                'updated_at' => now()->addDays(2),
            ],
        ];

        // Insert stages and get their IDs
        $stageIds = [];
        foreach ($stages as $stage) {
            $stageModel = Stage::create($stage);
            $stageIds[] = $stageModel->id;
        }

        // Create stage items
        $stageItems = [
            // Setup stage items
            [
                'stage_id' => $stageIds[0],
                'name' => 'Profile Setup',
                'created_at' => now()->addDays(3),
                'updated_at' => now()->addDays(3),
            ],
            [
                'stage_id' => $stageIds[0],
                'name' => 'Payment',
                'created_at' => now()->addDays(4),
                'updated_at' => now()->addDays(4),
            ],
            // Compliance stage items
            [
                'stage_id' => $stageIds[1],
                'name' => 'Compliance',
                'created_at' => now()->addDays(5),
                'updated_at' => now()->addDays(5),
            ],
            [
                'stage_id' => $stageIds[1],
                'name' => 'State Registration',
                'created_at' => now()->addDays(5),
                'updated_at' => now()->addDays(5),
            ],
            [
                'stage_id' => $stageIds[1],
                'name' => 'BOI Filing',
                'created_at' => now()->addDays(6),
                'updated_at' => now()->addDays(6),
            ],
            // Finalization stage items
            [
                'stage_id' => $stageIds[2],
                'name' => 'EIN Filing',
                'created_at' => now()->addDays(7),
                'updated_at' => now()->addDays(7),
            ],
            [
                'stage_id' => $stageIds[2],
                'name' => 'Bank Registration',
                'created_at' => now()->addDays(8),
                'updated_at' => now()->addDays(8),
            ],
        ];

        // Insert stage items
        foreach ($stageItems as $item) {
            StageItem::create($item);
        }
    }
}
