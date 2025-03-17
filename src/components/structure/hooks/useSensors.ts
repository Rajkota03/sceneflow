
import { 
  KeyboardSensor, 
  PointerSensor,
  useSensor, 
  useSensors as useDndKitSensors 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function useSensors() {
  return useDndKitSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require the pointer to move by 5px before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}
