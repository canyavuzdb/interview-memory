// TODO: Backend hazır olduğunda yalnızca bu fonksiyonun içi gerçek API çağrısıyla değiştirilecek.
// Fonksiyon imzası sabit tutulduğu için form bileşenlerinin değişmesi gerekmeyecek.
export async function submitHRProcess(formData) {
  void formData
  await new Promise((resolve) => setTimeout(resolve, 600))

  return { success: true, id: 'preview-only' }
}
