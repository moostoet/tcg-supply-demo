import { ref, watchEffect } from "vue";
import { useRoute } from "vue-router";

export function useBackgroundColor() {
    const backgroundColor = ref('white');

    const route = useRoute();

    watchEffect(() => {
        switch (route.path) {
            case '/login':
                backgroundColor.value = '#1565C0';
                break;
            case '/register':
                backgroundColor.value = '#1565C0';
                break;
            default:
                backgroundColor.value = 'white';
        }
    });

    return { backgroundColor };
}