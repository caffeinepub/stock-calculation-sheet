import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { StockSheet } from '../types/stockSheet';
import type { CharacterSheet } from '../backend';
import { getDefaultSheetState } from '../utils/defaultSheetState';

// Convert backend CharacterSheet to frontend StockSheet
function backendToFrontend(sheet: CharacterSheet): StockSheet {
  return {
    openingStock: sheet.inventory.slice(0, 7).map(item => ({
      name: item.name,
      quantity: Number(item.quantity),
    })),
    purchase: sheet.skills.slice(0, 10).map(skill => ({
      name: skill.name,
      quantity: Number(skill.modifier),
    })),
    sales: sheet.abilities ? [
      { name: 'Strength', quantity: Number(sheet.abilities.strength) },
      { name: 'Dexterity', quantity: Number(sheet.abilities.dexterity) },
      { name: 'Constitution', quantity: Number(sheet.abilities.constitution) },
      { name: 'Intelligence', quantity: Number(sheet.abilities.intelligence) },
      { name: 'Wisdom', quantity: Number(sheet.abilities.wisdom) },
      { name: 'Charisma', quantity: Number(sheet.abilities.charisma) },
    ] : [],
    suspense: [
      { name: 'Hit Points', quantity: Number(sheet.combatStats.hitPoints) },
      { name: 'Speed', quantity: Number(sheet.combatStats.speed) },
      { name: 'Armor Class', quantity: Number(sheet.combatStats.baseArmorClass) },
      { name: 'Initiative', quantity: Number(sheet.combatStats.initiative) },
    ],
  };
}

// Convert frontend StockSheet to backend CharacterSheet
function frontendToBackend(sheet: StockSheet): CharacterSheet {
  // Pad arrays to ensure we have enough items
  const paddedOpening = [...sheet.openingStock];
  while (paddedOpening.length < 7) {
    paddedOpening.push({ name: `Item ${paddedOpening.length + 1}`, quantity: 0 });
  }
  
  const paddedPurchase = [...sheet.purchase];
  while (paddedPurchase.length < 10) {
    paddedPurchase.push({ name: `Party ${paddedPurchase.length + 1}`, quantity: 0 });
  }
  
  const paddedSales = [...sheet.sales];
  while (paddedSales.length < 6) {
    paddedSales.push({ name: 'Stat', quantity: 10 });
  }
  
  const paddedSuspense = [...sheet.suspense];
  while (paddedSuspense.length < 4) {
    paddedSuspense.push({ name: 'Value', quantity: 0 });
  }

  return {
    inventory: paddedOpening.map(row => ({
      name: row.name,
      description: '',
      weight: undefined,
      quantity: BigInt(Math.round(row.quantity * 1000)) / 1000n,
    })),
    skills: paddedPurchase.map(row => ({
      name: row.name,
      associatedAbility: 'Purchase',
      isProficient: false,
      modifier: BigInt(Math.round(row.quantity * 1000)) / 1000n,
    })),
    abilities: {
      strength: BigInt(Math.round((paddedSales[0]?.quantity || 10) * 1000)) / 1000n,
      dexterity: BigInt(Math.round((paddedSales[1]?.quantity || 10) * 1000)) / 1000n,
      constitution: BigInt(Math.round((paddedSales[2]?.quantity || 10) * 1000)) / 1000n,
      intelligence: BigInt(Math.round((paddedSales[3]?.quantity || 10) * 1000)) / 1000n,
      wisdom: BigInt(Math.round((paddedSales[4]?.quantity || 10) * 1000)) / 1000n,
      charisma: BigInt(Math.round((paddedSales[5]?.quantity || 10) * 1000)) / 1000n,
    },
    combatStats: {
      hitPoints: BigInt(Math.round((paddedSuspense[0]?.quantity || 0) * 1000)) / 1000n,
      speed: BigInt(Math.round((paddedSuspense[1]?.quantity || 0) * 1000)) / 1000n,
      baseArmorClass: BigInt(Math.round((paddedSuspense[2]?.quantity || 0) * 1000)) / 1000n,
      initiative: BigInt(Math.round((paddedSuspense[3]?.quantity || 0) * 1000)) / 1000n,
      hitDice: '1d8',
    },
  };
}

export function useStockSheet(dateKey: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<StockSheet>({
    queryKey: ['stockSheet', dateKey],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const snapshot = await actor.loadSnapshot(dateKey);
        if (snapshot) {
          return backendToFrontend(snapshot);
        }
        
        // No snapshot for this date, return defaults
        return getDefaultSheetState();
      } catch (error: any) {
        console.error('Error loading snapshot:', error);
        // If unauthorized or other error, return defaults
        return getDefaultSheetState();
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: async (sheet: StockSheet) => {
      if (!actor) throw new Error('Actor not available');
      
      const backendSheet = frontendToBackend(sheet);
      await actor.saveSnapshot(dateKey, backendSheet);
      return sheet;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['stockSheet', dateKey], data);
      queryClient.invalidateQueries({ queryKey: ['snapshotDates'] });
    },
    onError: (error: any) => {
      console.error('Save error:', error);
    },
  });

  return {
    data: query.data,
    isLoading: actorFetching || query.isLoading,
    isFetched: query.isFetched,
    saveSheet: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error?.message,
  };
}

export function useSnapshotDates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['snapshotDates'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        return await actor.getSnapshotDates();
      } catch (error) {
        console.error('Error loading snapshot dates:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
