import Vue, { VueConstructor } from "vue";

export const showDialog = async <T = any>(component: VueConstructor<Vue>, props: Record<string, any>): Promise<T> => {
  return new Promise((resolve) => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const instance = new component({ propsData: props }).$mount(parent);
    instance.$on('close', ($event: any) => {
      instance.$destroy();
      instance.$el.parentElement?.removeChild(instance.$el);
      resolve($event);
    });
  });
}