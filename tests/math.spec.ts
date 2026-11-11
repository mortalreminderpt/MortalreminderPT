import { test, expect } from '@playwright/test';

const article='/computer%20network/2024/10/19/'+encodeURIComponent('计算机网络-一-物理层')+'/';

for(const language of ['en','zh-cn']) {
  test(`${language}: physical-layer fractions render on desktop and mobile`,async({page})=>{
    await page.goto((language==='en'?'':'/zh-cn')+article);
    const content=page.locator('.post__content');
    await expect.poll(()=>content.locator('math').count()).toBeGreaterThanOrEqual(14);
    await expect(content.locator('.katex-error')).toHaveCount(0);
    await expect.poll(()=>content.locator('mfrac').count()).toBeGreaterThanOrEqual(5);
    const unrendered=await content.evaluate(element=>{
      const clone=element.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.katex,math,pre,code,script,style').forEach(node=>node.remove());
      return clone.textContent;
    });
    expect(unrendered).not.toMatch(/\$\s*(?:\\frac|[TP]\\text|\\text\{Latency)/);
    if(language==='en') {
      await expect(content.locator('.katex-html .frac-line').first()).toBeVisible();
      await page.evaluate(()=>document.fonts.ready);
      expect(await page.evaluate(()=>document.fonts.check('16px KaTeX_Main'))).toBe(true);
    }
    await page.setViewportSize({width:390,height:844});
    await content.locator('math').first().scrollIntoViewIfNeeded();
    await expect(content).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/is-in/);
  });
}

test('legacy cached math is rebuilt without the accidental formula table',async({page})=>{
  await page.goto('/algorithm/2024/12/07/Variational-Autoencoder/');
  const content=page.locator('.post__content');
  await expect(content.locator('.katex-error')).toHaveCount(0);
  await expect(content.locator('annotation[encoding="application/x-tex"]').filter({hasText:'q(z|x)'}).first()).toBeAttached();
  await expect(content.locator('li').filter({hasText:'reconstruction loss'}).locator('table')).toHaveCount(0);
});
