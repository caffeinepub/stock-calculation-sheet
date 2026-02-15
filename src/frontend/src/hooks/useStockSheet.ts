import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { StockSheet } from '../types/stockSheet';
import type { CharacterSheet } from '../backend';
import { getDefaultSheetState } from '../utils/defaultSheetState';

// Convert backend CharacterSheet to frontend StockSheet
// Backend stores values as integers (multiplied by 1000 to preserve 3 decimals)
function backendToFrontend(sheet: CharacterSheet): StockSheet {
  return {
    openingStock: sheet.inventory.slice(0, 7).map(item => ({
      name: item.name,
      quantity: Number(item.quantity) / 1000,
    })),
    purchase: sheet.skills.slice(0, 10).map(skill => ({
      name: skill.name,
      quantity: Number(skill.modifier) / 1000,
    })),
    sales: sheet.abilities ? [
      { name: 'Strength', quantity: Number(sheet.abilities.strength) / 1000 },
      { name: 'Dexterity', quantity: Number(sheet.abilities.dexterity) / 1000 },
      { name: 'Constitution', quantity: Number(sheet.abilities.constitution) / 1000 },
      { name: 'Intelligence', quantity: Number(sheet.abilities.intelligence) / 1000 },
      { name: 'Wisdom', quantity: Number(sheet.abilities.wisdom) / 1000 },
      { name: 'Charisma', quantity: Number(sheet.abilities.charisma) / 1000 },
    ] : [],
    suspense: [
      { name: 'Hit Points', quantity: Number(sheet.combatStats.hitPoints) / 1000 },
      { name: 'Speed', quantity: Number(sheet.combatStats.speed) / 1000 },
      { name: 'Armor Class', quantity: Number(sheet.combatStats.baseArmorClass) / 1000 },
      { name: 'Initiative', quantity: Number(sheet.combatStats.initiative) / 1000 },
    ],
  };
}

// Convert frontend StockSheet to backend CharacterSheet
// Store values as integers (multiply by 1000 to preserve 3 decimals)
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
    paddedSales.push({ name: 'Stat', quantity: 0 });
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
      quantity: BigInt(Math.round(row.quantity * 1000)),
    })),
    skills: paddedPurchase.map(row => ({
      name: row.name,
      associatedAbility: 'Purchase',
      isProficient: false,
      modifier: BigInt(Math.round(row.quantity * 1000)),
    })),
    abilities: {
      strength: BigInt(Math.round((paddedSales[0]?.quantity || 0) * 1000)),
      dexterity: BigInt(Math.round((paddedSales[1]?.quantity || 0) * 1000)),
      constitution: BigInt(Math.round((paddedSales[2]?.quantity || 0) * 1000)),
      intelligence: BigInt(Math.round((paddedSales[3]?.quantity || 0) * 1000)),
      wisdom: BigInt(Math.round((paddedSales[4]?.quantity || 0) * 1000)),
      charisma: BigInt(Math.round((paddedSales[5]?.quantity || 0) * 1000)),
    },
    combatStats: {
      hitPoints: BigInt(Math.round((paddedSuspense[0]?.quantity || 0) * 1000)),
      speed: BigInt(Math.round((paddedSuspense[1]?.quantity || 0) * 1000)),
      baseArmorClass: BigInt(Math.round((paddedSuspense[2]?.quantity || 0) * 1000)),
      initiative: BigInt(Math.round((paddedSuspense[3]?.quantity || 0) * 1000)),
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
      throw error;
    },
  });

  return {
    data: query.data,
    isLoading: actorFetching || query.isLoading,
    isFetched: query.isFetched,
    saveSheet: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    isSuccess: saveMutation.isSuccess,
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
