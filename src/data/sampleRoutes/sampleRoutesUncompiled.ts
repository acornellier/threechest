import type { SampleRoute } from '../../util/types.ts'
import { type DungeonKey, dungeonKeys } from '../dungeonKeys.ts'
import { decodeRoute } from '../../../server/decodeRoute'
import { mdtRouteToRoute } from '../../util/mdtUtil.ts'

type SampleRouteDefinition = Omit<SampleRoute, 'route'> & {
  mdt: string
  name?: string
}

const sampleRouteDefinitions: Record<DungeonKey, SampleRouteDefinition[]> = {
  aa: [
    {
      name: 'Safely press W',
      difficulty: 'beginner',
      mdt: '!TwvYoUnmm0pMEVWusEr37LErOaQa9MWKf5I0XiEqS9SCz(2ROeLJPh72ldsCcHm5JVhxSDG7No7O)1rN1EO13927p80n)WW7p8lN9fV)rNb(AHZE(sB7LttDJV5mc8GPlND2Yd6xol7FSbC2Np0n5r0onD7M)64pM66CMc0x6e70Xo)Z(ocs60VnD93((RF)8RoJQeVXGVZFA8s)1aAbE9uaOHGPbI)isMgvWvJWzWqmsNPk8FW7t9D93C2V02QkABdNysbiPWKuyIO7gqrNd10nGgcqqJgQWHOimLbdK3MQGbgTPoyeHRjyePJo8f)hIxrle6yyaIDmoabpgyi7HROvjEfTQWlUyqPOJIrYQbWcXGuwsIsU4(mrUH)OcvKalj9vrYRMuxZhRTQiYjGlzPBbRp2KAbrhA22R2weo0Rk0b9Nav)S7dio)RcoRpL0sDmaypjRksTZM7Z1Kee5QTj3Kl)yosv1yPA56W88X8KqUXtt7ZnQ8waOwZmnjGSKVZb0)ko1K8KkwZ08kyQqO4tLL7utRPoDd1PLuNEfv1ZZn51HT12mzjUxTnzV)8I82tYnDgTcoA1C0G9wyZ7EKBzXccEPtXHlRb1ElEPDU6)3IhuTm7CuNLYkQS7(juZKc)bPI9leu0Pz9QTQRRB7ls2(7oGMbOCvCckbY9wFefS4x((ew(Pgp0WAvBSYisLg9EvcAad)y7p(NW74gIVHB05(l',
    },
    {
      name: 'Standard fort',
      difficulty: 'intermediate',
      affix: 'fortified',
      mdt: '!fwvtVTnmm0Fm76wGLSKL11UIb0lgdWb7OHCJLt1QRDH)OP5I)Tprjkx78bgksdJe5Jp(OOubPyFr(O(ZXI88XY2QY(QzvDxV93N06xlYi7IkYRm11MdtnJNlYOWctMQI8HjX7htMoMglkY)OSzsdGDyQVx3o(7PMMISiWzCL8PNB0FOBqmXvFCQ9OUR9PQplYyCyJbDJ(WOPR1IMLgVBbAWAMrC)J6nZsSUMrTXaFhxKbHoA3jg3NI7tW9JX9z4(Kaas0bcW1mM1WfchYfyKaGcgciAWi1AaPltIWtIW8riiHS0ml1zGudsSJd2qrYtSilCgaYElaAFCwSPogrHpU0qHYYxxw4PUerJHpolG6sxvMFORPRVi)B11SO6AOUPBepcw70nIZsyqqsxyE1KVkSlqN5uvNOMEBVyrpN65Gdg5L6Vx3JdY9MgahBacu)tr5xguF2vYVVxrcDEq)zb9Nh0)4G(NGNkIqwfFHWCvfd1merIlaY9k5GBIVo4ISN6RMLwYYjx(vcd)A523vCkDiCMp84vvqOJGJbRbpuGe21u23LKRPCGl8TuoEBoPxsujw(bD92jpB9S8kskq3s3TsQVklWzppJdTbVBY1NRwLeXw0UOLjx6SHHe0TL7riBRz2w4IxDD0nha9xmX2K9Lk(wxwbtcS7nx6VgJF7UK4)nUggO)QsGOJxDMhsoDR(TMJR0H7oTt8sZIEhDX9TPyAW(c5USEPXi2aiBBr)v8yFNKUPtDJHt0d59LlNyd)L398FTpkT8ouEvqvej74IKuPKLY5XeQWrQFehfTJXTcojnvq4Y0K1A7dqVl)bZXzf882S6Kz8LzvZ0W4SYmmRkNvh76SpfFQ88SASZ(tTDlM3hRdMw7YVaUw5FaDw90VMvN7MMvtd6zfSYpFC3SAVZl4txBZzaOwDFzdyUKftLU0hc80VP2OHfFR77ZQHo)g7p3xcjXYaZRAiqtRL()r)z5BtwWRn9oY3omQlR2bAwRTo9YxX)a',
    },
    {
      name: 'Tyran skips',
      difficulty: 'intermediate',
      affix: 'tyrannical',
      mdt: '!fwvYoUnmm0pMEUbMAxxl6LEXOaAol0SypiZyypi2EwU0V9kkr5APjffgoHrs8XhFKIXd(h8ULU3x8Uh(42XXF)R5NV(YS39wx3Z(w4qJ3D5AF)1ZRdlF4Bz4cRxV4DhF6n1YCd7M5rV71JdRDiuNxVDRBC5NRdd(2g8W0kU1tdDV2nqysR(91Xh7Mg)XL39TcjUXC3q35LRtJb0cK6LaqZbZwi(blz2QchTLf8b)M7Brxxc7WP9z0(aTpN2xq7dzaS0baKRTIGr0fjgl0qHGIgA0B0WemWW1Aj4HgkEaqekqZwt0GOgg4ihcUsKhciRJgiYjle6KFbSzrgXW3yyyyALYRa8SyGyC8nAHu3gZs35PHPBE3x67fn99yEZkepGYDwH4S5g6Kn6wsnL7CRcDruvJIQ5(Ns0CYK4qegBT(N0DEwUlkasQaOj93qYVnR(Ipj)PAfKR8O(lY6VmR)8S(ROUIgIv8kH5tzmMZOhQOdW)kLZhtJhiR6IuW47Ivw7Og2SiTLhSCoYZQHilDssguzjuNvodPLvLQuf183Rs3li2CmAs0P(6MUKLAAzZHDQs5LVkDj1kylyX2XHsfsuIkF3v(ICZsQDQmkkkkBuLxnWaOmLrIzUxtvZ58vOu1wF)sUDRZGUKLjDQ2SBoJHIRo3KtXLr1WClPU6UAEDtr)YDUQtJav7er0Fz1GqDnbzvhWuufUZWbAwQ9)mDaFCtNEkmuFBoU7Y2ya7bl0agqibfWm2ix(kWnhyAqZ5gDJvP1Y9fTVHkNZf(Fke7XWVPw1nCznYdCHHzTGWy5svcwEyzqBbLqAaUahtuJ6CbQ4J)p',
    },
    {
      name: 'Fort snapping',
      difficulty: 'expert',
      affix: 'fortified',
      mdt: '!9vztVrnmqy4FmCguSDSDYveQiuLSqYCIdw7xzlHgswL4uw4W(BNzShNgVDxuLANgp(DE9ZmXXXCFZz9nN9o7ddJ(lBM63E6uB)to7VBAE2zyFOWzp0E8y7(5o)FCgo(G52do703FSt8J)E(8JF2zFzB3Cdk2(5XXME)xN76CMcmz6j25DDnV00rAsp9tZ9p1m0)LdNDMsjUWutxZEF7qpOgyRtGqtqOHf(fpgAuqQgoSh8VcNb3QhwrqRlO1z06CA9sADMoLqvkd0SMsiiShjeGBYOGGqv0qqq2kyx1yqn5dwbviglwj0NrRbgYeQau5Gjnmj5ogOCWfmn(pHiq6GYSAu1GfdYgIqBhuNJ(oEcfOYHOsu6WP0UFOBy0zF3XJLfhpIN7i2KPdFEAys1H0eVcAYB8O9xKyH0v3wlSKLHecKUMYINOTGOnJGDjXAjHAbrAfbAnX5QeNRtCoESrqZKjshrgI6iYqwhrgc7aJ9bzE17OR4KPexZLDvr8fbh7Ehz8qJPPwJpjjUkhFXAKiDAUm1zQtCQiXjobkwAQmIqfbGRAJrFOx7d2YRcL5orLx6RA3QmdM1FJZkvRlsMVxvdDEnkP0e514gZJrUxNDqsTlgpNHL5QLxKvoVMWtQ))20xpzYZpj8vxOSQ2VX6P34Itl6BNw9YidDHM6otKS0Ls1u3VIA(6vVN4dxHKlq65v3Vns(uKzGenKjdWUQax3PxQW6D6d3G9)VSb)XoS7NWL9l3VBpKSlm1QzAjVqwwi1cvq63J3rlufWcYcLUsRLRBzFejK1cFb7YM5j4Jyx24hB3)80LndJWN2A)vB3wiy7U2UwFBZe6GEyBrZ4(ha',
    },
    {
      name: 'Tyran big pulls + snapping',
      difficulty: 'expert',
      affix: 'tyrannical',
      mdt: '!1vvYUTnmq0pMEUbCF5ArV0lefG5mH3KtzSSSHTuwU4V9YHCOwCCGbSPjN5nV5npkfOHNd((Mp6d(N)8Y6UBRU2T(85y3lb)7nnhco6tKGFxC)(42H2(pdogSXqCxWRgI83)3X4rdp4FBD7qdG22HlxA66)7qBBWrGGXD8dBABERPfXe393dDV0CQ7p7(i4es4GRnTnB7JN6sOL415eqxtlD08xSYsNkfQJLYb(LhCqQorbBNSqtNkDu63(02CmpoMhfZJHNlWZP6AaMAeeeA2i2vWz5QRtlYWAszzHfwKFucwikfzeTs5eHC5kKQCH8ujYoAc5mlOA4p5vjOZitTaQzkMHnVcODgDgW7shYbKZRarrM7s)2tTNUe8)y)Ebz)EOVlYPS28lddcYMdlREJrjRsKQiEMhNoufroGS4AXOy1S5Oatr9vGYRC2OdexfQTAuAnvP1wL2sNcABHBG4wujqDlQeiVfvc03k1tWmXDGvmKu87LInMIIvub631YqtdHPMSSyhXkDYOOp6n5ZeM(jz2w1jsvNyvpE1iwKqfka3n5k8qpNh0r3F9AJTcjzj1QxV0pnVBMMDFDsxmkMfLRkQu2YoTWwNyHio241BGM78hSLCrGHX)ARxMu25M25JG68TA6MKPV2ywuhrJI6BSl06djS4OXGtg9mtCF(k9saQ7BwycM1n1BQOL7(UxUWVodFYdn0tfcBCQ9XDUT6KHp(tBEn9m5Xhd73vzBYrPPAjJifePMRYL8NWJm5ks6ajrPnATC(G8xGa59Px0CB1W107AUTQ)sC7HR3wD6s6nqXJX21PfR3eBJ9XMRad6sPH(ZPQtsDVsqOmIvP1c4kouEEAFMKjywbxkmCJ6bL)q88eUWNW)ba',
    },
  ],
  av: [
    {
      name: 'Safely press W',
      difficulty: 'beginner',
      mdt: '!fwvtpUniq0Fm9(kZySn((EPxqRevQ3qB(awLwuCuS92n9W(BFbZGdqnPksX24zEZ79ygSKi)HumP(yske70kZTpF9Yv144NV(tP4pk1VLCYtvsXXtA9PdZMPBso4wy(0rPGr)7r9T9xMm7KI33zMvo4omF9Q680lZgJKx5cgxrmV3OExzqmXvFE(8BQHZF)4hsoL6EXOYOomDA4SfnlXUybA0ElNe9h3fjhK8g31AjV1DL6HM34zjV1(k7vlihgmdxLIVP10kT2UIn3i06q0yiA9lzzVZ)Askioi61rbGrrquiuegstGvT)lnOlLG6sUfrObbOfZVdtN5PthgwnggnNw7zET1edAGvacAnckfDQE0PiU9kBnqDWS3aP1Tjxeoz4cyPuSYMfncMQnOvMZ49wws4XA2PIGZ6nwlNtQUL6LzJ3J6tGVldMA856S2TW60TH31x4flICapidVcQ31v4PhMzZJJVFDlafCqpmm((qNyvMVeiutMGBljSvI5LauiVaUDpO7BZrj0sHKET74gpA4wNvMN0yLbrBGX4LodDNVfNPWm7lv31nIfKGQ0(rGK5h1OFqX(y03ailoA2uluA6Y7iR1fYQBM)bWMRVXyOxXqv6(n8OtoxoXRcpEXFAs79ttwlDivS3CJz0LQUXWLV6RCk(BbBom5lju4487dr(ia6)zgW9tmS)x2VsnU8nQjP8l',
    },
    {
      name: 'No second ring',
      difficulty: 'intermediate',
      mdt: '!nwvtpUjmq0Fm9CJWgBd(AvV0EWQs0l9IfjGzx26G3Lpw2CHF71gpKyqHMvrea75J37nJhKi5VLz9Qp6LzcZuENQW0uoL3w38KmBuP(RuGoejZkRRQQlg09xKcSBHH6sz2PxksF7cD8TrTm79J6bLlCfdTTQM(FnO1srKZyyLSHtA17knety1Vp08KY08JYpKccXTrNsRk6Rnn2Ozb2R2a1zFuGc(t4SuGLcQ7ESuWC3j(qlOEuky2TS37Dw6Dd5FLaVMarjfIcFE7ScJ20kZ(svfjQQkW)99Ao3ljhr8PjEvwVgwxq5vbgawrH4IyRbnEnOrGzWY07Neh2j38JbwTKdgG9ea7Plqh0Tz9lXRFIuqV5axrZxZpHwOnYbCasjqYI3uKazjDpz5uQxTNPeztqiqqOaIzRPpKA(DejNxqFGf53tedunNU5S0lyrFoqGqR7Vq49R8KajcheENBS1KbL8a2KUFT33GLUkn0aweMUTnfXa7iBGbjWUnSYx48QpFpuXbY7LvC0ArdJ(pSnaoy8NYUa4TCk2xMUMx8M8(OZgC4SXCRFiqyB6Ztwda(1MkFLahTUSFJ4lmcTqj0cNqBjFkykFXYO9MDHIxL0WjN3DOeA(Kho(rZvqZh9WKhCA29lZC6f7m9RJXZkxgLAjiJZiuAmpMtzZi7RilB58ugJMgNKGOuINIET4BUIr2pho)6uEPzSzkVQ1CEk)zvRAkV3(DS(Nv3(y2jtx3u(Xw1Xdt5)XmmLpwR1t5nkLD3oZzRTJhV49StBgNYVygATr9OwFWb(gBk98q(pa',
    },
  ],
  bh: [
    {
      name: 'Safely press W',
      difficulty: 'beginner',
      mdt: '!vA1YoUjmu0pMUTnYVFSTTlA3evjQu3HGKyYWuMWicmp2W3ETnxtWEGzufsrySZ5CUhFVx7CC(VZZ6nV0NNLvwzAEDS4XoZ1RJf)jp7zJ5V57X7q5zNQRQQpo00)A(EI7dd1NYZ0hlPVuECO(H8SNkBgmo0oo01zU0)RHMM89i3AHVKnCOX8KPbGe(63hUC20E5NNEjFpt5M4QPXCSVU9IfnRUE0c0v7R7Xl(XdrVvlXdPXdzlgAxQx521SNonnpA1zhBBA7YZ(uvfdvvnJEatkacdaHeZbdMMhJnHnnwSoxoM0vlKo8VIJUeQeavYeQIzcgQ2oiz3qneK8yMuat6yMOPbXb1KHXxge04GGMSNGILllvFofoVGG(sc5eZnXyuBj3a0YLqheepMQa2Aa7WYuBPBgAAdvTe8eJC2eczMysm583k5jhw7xakophNuvGjBTPRHihqG(ofiwrg8x8huiH5RmV77YeDPxZmDaHFtDrOgeITzLgCsSorBllaDqkGyqMOXGM3OIupN4bUyu(HNzCq0eGcVM4Z7Uy(69eWQpQHdq2SDh65GzPgnnXHPjomjWnj4hKGHqKGCjEDlSVq3QReif6QcY7b8eLLudoBZPcMKi43lf0jwoOvp(Yj8T1yEVF1(AGIKBSxmBuHCrAixKIbQPeGBkfiNYa2PCGEQxpA7lYTAkozbe0wB(Z5BEPsWBFsbBrAezJMEe56TqU1yAk0jQKts1RwdVslOPizotemukEJnsFHQpVdfY7Wb7eCtgyMCWlfaKPNUt)pYvwTT3K5olDrI0LaUkaxDIoyj6yP17wVc0Hg0bCwXkD1iKLcHGtiINgWrNt4D1qmJdb98gXYRj4gV8mfhgITA4r80r1Fqxk3tw7H7TxsB(EzzNcKiL70cTqO4mbwO9m(fQqUJiWkSqWqiHwjNcIPy4Ro9N9JHZJfD1NVRFSO8YPXIZTJfdpow0FNXnXPZghXxSlhUvXnsz6DmmxHqsbJJW8jwj2gCmksZieoLYWOvy9BDTUB7ESSZuzVO5RFES45YAReQA7S3fUSVR1E7ZB8sxYRqQ3PKsgvHyefgf4124Gk0mKWoNMJyBeSnMQqSE)Wd(iTRD48DqiFO9Izb1UN8)b',
    },
    {
      name: 'Standard',
      difficulty: 'intermediate',
      mdt: '!DAvWYTjmq0pMEUEqsiK4ANCPhkTZqpRbBJWHyQXJn4MEHV9kzTlwsbM00jzMG2SA33(23UGIO(PQCq)6GQ8jDZ2XUHPQHNVO17FwFDytB)ufrv(BT(OQGSjrvw3200U343FufuRHX2Av516Z18FvFy82zv5TTDJABC3pE5I(0Wpg76ufjwNblLJ76030DqmbRpnE6GU)0xRFvvKkT)JR6o9(H2(tMOzq4ztGUAESWI6cM7PcMXZcQ5k2)YCHSi1HUb7to3iGBuWng429RXn)6CNh7EQZEMNDdu2331Frv(PMM0KMgRd0zGrMZnn8icLmi2IWusdZeCuUCITPn)EIz(jMfMy4isv8qCibCKJmxsiGyHak9TLE6J4H5iQOIOVOsxgKjVIBN0XQC)qhJprySZHyJUjxd3wKpFr2cKHVSbfceAyY5VTF4IQ4UdjbTntyIotxxp5ARo0Z(huV2W9bv5e(c(BTNTUAZ1qYdGfhUEgKobKoIeYh5EtjdAkgUbiu5dcLSMCmdcMicZGSKi9guU3HIPYCOJand2AYEKKiilrIPPu4kODr4mkj)dq)w2ididbWfYy6g3Qa6g(YJpZTlweoO4Salbrse7KppfasrXkLkgsgsZmggYuO6yCO8yzq9XeRTMe6cyVGMGmgjwjJAlckUibQlFfG)RawChPlQ0K1h6s9A40v2wrfH7rPH7MnS(ItvlSwZ144(LQDnn5)ug5MYKiDM)GozH7zmnVp0IIfwA6ekS0iQNU26qxtA(DCX4ksUnJpFQ3IpjGVCCenbxSqqsGIlwyaj4MNjjEmS)RGTN5lSiBX1XU5aw(7SF0(tz)UxmF2Y8xQuwJjrW3Kj4cPmLlieP8Ek)mlxSHAmqPKeoNWz(FgZxSvB530D1tv9xMQoSDqpvD9y75ntvF3y4LXRMVz7yBx3uv7WgB(pzULdkQ)ca',
    },
    {
      name: 'Mind Soothe',
      difficulty: 'intermediate',
      mdt: '!DAvtpUjmq0Fm9Cr2J)KRv7LEO0krpJiFy2LnOWQey3Tx43ETR9qWoK2nvjsbmJN3BEZZtOIw9ZQYbZ7dvLpyA2m2nmvp80jJz3tMZdzT9t1t1qv5BgZHQcAgPQCFBtt7oBK)QQaClm2UVQSR7W(tV9Sq0STQ81nDJgxM3nE6K54Wpg76QkiUGdRuoUTZ8QPlKZWQpmE8rt)XVU)9QcU29GZMoZUH2(J2Sz54l2eD2EzHJ3fm)vfmBKfGDlUFz(uwW9SBWDLpmAimiegle2F2MW(1hUinCUFD5I1TuzxFx)PQYp10WjnnUaGzIf40L1WBrglIzMoavowaKyQWIzapMbo8ZBMtpBLKUufW6IcXGiwOIj1hFrgirYGnDj3dRltCYwTxM84X(anfx6UZMhvSs8U1Vz3ZvFxe3zAjrvsLsec(eAcK3QlsvjsuoEpGPIHBHhklQiuxEIidePqfsVgjs(mrI8d(AsfvtydwgatHyPrSYrSibS8Mf9fZc9wwwzizQerjyDP6W9ZL81UmVhwhX5R0uSVtXgpnTZZdBrKO(qQ6)bCuoXqg0cvqk0xR2EJTpXinqdKkXaYsObKhcKrqICL2Kh6NHdFQBuPykzOiZqFfd9vm0xXqFftLwp48SWrBSvaOXhOPhjqNffTw0iV1Y(pB9Pm5ZNd9dqaY)AARNxGCD5guXtAbD8zqiF15eRmt1xLILLQBsl9)0frXJVaE8fLtw8KtBZ7Ug9TYaBVxKXtKE4wtM9EuXYrGllvvy)6apYt49SRlSoFvB6kJE9gAXsF2Y8Yt0JLTAhp0b9ihNiqU18qVlCgOuHxKk8r)v5FF8ZC1IQMyLPURoWZFSLLFR)3mmEX9PSF7Z2xhA(nGk3JBYEUwkumQayuWE0WH4Nbcnti0eqkisgWHLVD0xC0V8BTh3pvx23p8KzQE3MhnoyoAFA4LxMHaeYmqY5mjNOOsHiac1oKbeklc5mQcKe9DIclcfojti1alxQuaiLCpk5QmfHOPsMTCyuT8obHVeelBZKkHsR5cfLQ1EmywqSvcfakriOUc8kmmDwm6pnv)4MblkNp0(s2u93Tl884z77oFOTRBQUDi7c2Upv)g',
    },
  ],
  hoi: [
    {
      name: 'Safely press W',
      difficulty: 'beginner',
      mdt: '!fwvtVnkmq0Fm9(kgJbd37L9cQsUs7nR8LPLwRqva62Cj)2xBSn1ZuiRqkep88BEZ43akq9SsoQ)AujL7B1MR329Xf9WWTD)52oqj)Rw)UQb(vMsEQRTT74Kz8QQH5cm1DYcGT)WRxZFTRtj)CVzs7i840Ll6ZJpnzmQMmh2qe50bJ(tTjqzi6JtNFr3F(3N(s1WRDpyqB0hh76pBzZkTpSeny)BdK8ttUf5OvljlTlM1MnCEimpeoGMhcdZlLh7n9xuYhAB5zTTj0H3ma4CvIZbKHjNf2wjojUuu3USXiAraDL7EUQP(NsJNsFiNXKaK(GGOniIJrvZHkFjxG4LJPRIqxSnhXXt7bj9Qe97Qah0suEkI4ld1niimsQquF0ZOWbTy7JuF3UYbOmbvInPE9n7sHV5mdqSYMDso06RU)JRtSfibwhkdilnjR5hSnLfxwvIj0HtGZs8aItROOdhG0(rrIx1LncBI1TY1lhQG3OKH6JHCCV5mW7OyB3)9hEG3oKJ6HXOlTy4oMaEkcorNfeEl3spXHLaICYrEoz)mu8vggabIhoPUyOtXV1jnp8TgnaVnr8)goGAKoki6iU(EwCN5C(nLfr8RmhXYq5PKuxCsDvS1ScZ7S2CUD594Zolw264w8VUlz)H3SFUzy(JnJk1)aa',
    },
    {
      name: 'Standard',
      difficulty: 'intermediate',
      mdt: '!fwvYUQnmu0pMUUippSTQBAxevj31wabNhPKMGcjV(6g(2Rn2oyNbQcKq894ZD4CVgnu)tTAW8XGwPgo0E6q)jT6pgZfDbChqRovxvvxo2m8xDbYTWyTfGzqy6hm8l8sT69dnJghnLJ99M2HFm20OlaoWHvuJhBmVBAcCgw9RJTVz6A)2Pp0fePZWntJPCOUR1YMnGUAj6M9NfWKBpOOa5JMcS9J95GBLCZ4GzK3mEJDtCpjtSqsGzJGYUMUET6tvveqvvIB8OObYyjKL4RuZjCJtcHeF48GSkz)E0880Je2mn3v8WYIqKiZDjzz6qsb4rjcKidKab5SqNhWhf(IcntFi5rSyMaet)iUPsoiAyrX3fVoOSm)elVWy5hYNXikIaVSu7zK7Gs3w09cIWbG)6(pXRnldMxr091qzQpwtoDDPrfj6mwahp3jXs8czxgsBiWHKTrB8m245TX(9ovUSY16LpxlMp1ciqRJtojVbe4SsLTpjjRCVt)FZObgWRCIqkFWz8f9h7Lk5kZRbgXzJjp9dDMFc99Wx1X4e7hJ60fJDphEdmItAgsJ)nhxdiKBvhN0JhTJiWw6BaN7s1D8x2JUNoTwDkgueYojfbPmGGkeu5Ju9Zi7Sjrcjcmgijuge7NG9P(xC5TsDP(QJ6w77HZtMOfXa7eCksYXabbXd0seIDuOaWrmgJJ5SLS(9XFF9((r73U277hoBUzUVVVR8YT77T))399N7AS37RF78WtV7U0)d',
    },
    {
      name: 'Big pulls',
      difficulty: 'expert',
      mdt: '!vsvtpUjmuWFm9Alc)TDpUQxALkQsSNTiHysOlb2sGS7EHF71pJDIHKuPQOn41zEZBMXpJgPFwNpyEFqN)u9(PIxhBAoPZFZyErNHss157QRQQlhBg(qNHHngR3PZFz4irCS6p4Th15N30mAaIkh77nTd)YsIolfa73jFCBJ5SPXZPF3Vn2U301(9DVRZOk4hozAmLd1DTw2SsAwnpBRk6lhfz4z1KrSLcpP6mg8KPZ42NdaILWjZBt()yH6HJxWsEzxtxVo)tvv00QQO2nJw4rl9KR8KJsxQnQhhBP2Ux5rAzzvx0cOevvepEJgGJcwfrwQcPhGyvcrcfsdfIc(aVuroF5GIUnFOXq94zb88a1IvmgcCezTl3kNtCgaLfDCUOVqNbuCaa3Jk4i6CZe3erSGC4bNk8ZdixkXTlChMclENPL2fUyrzx4enc4Y1jem444gbtAoYrw2Xo2rw6Xo6rw(Xo(r2gGDnajc5nsgIdK66HNm6WB1qa9Q5cgpK3H4wSKevW)(5tLFFE0KbuMFo16W4uh85dofOPZtKZncFFyGMNpsN7lz1DoKV7ENJORondQGfv3GllV)v9BUdR8rM3xKOqlUFSv9XpfHK)J(aZqu)i0n3xdV7WNFKOupw)RQtDz22hOQhN(E(DmJtFC87oLGp5DB)T9vWxERB(UqyZvjkPuqPeHqjXcNv)cLWsiuEkrWOCgvYMV(m78NaBN)JXJVov0D20B)2(3WH(UX9hGf1NMk67kFjzQ4NBA)yQ4Oz4q3UtFDQOXS51pB)vZPYrJDXB1n7MkkpSPFp8VMHYeqUT2M4Fv2fPI5PjsbdReKujfluEPkLjmKmvG5CUGi4psQJGCBb9zozMfOvNBAT9)qhOI(69hgU2D4J(Va',
    },
  ],
  nelth: [
    {
      name: 'Safely press W',
      difficulty: 'beginner',
      mdt: '!nAvtpUjmq0Fm9CJShSn4Rv9q7fuLCL6nlYhMT0Lcrbiz3l8BV24XSysqPkisWm8EV5nZyIMQ)Pw1BERxRu7ln1VpwC(IPRBS4xA1nJ5vDoDhrRovvwwDCOU)DDo4wyO6Kwz6gQVko3ZUPvx3xpyCODC4Yftt)pgQR15exS4kQHd1MRMAesC1Vo08IPT57NEtNZNcVZuBo2x12yrZQRZwG6S)mNU40ee5Gxm92l3AD4bRNNypCFZShyCmmo)ZPo2w3ErR(uzjJuw6IWduaoocNaHlfHjbVFcE)1WNedVdC5e8(hmKfSvQpdHtUIgkzf(Y7LpBkcFa8fUrKmoK5ZYPayp2l5leNBzkM7aALt5mh9gb6nPEVjpdtc5CsiESwklDIEoGGweXAGolcoQcAkkdkgA6INmukCbY93oBlRiqF6s6trqYqqKRKtOarLXKV85wqkGlNCF5Y3omfOCBj6RwYOQfjwtaju(MluqS4KXIkyP81IsIocLeXhDfFHEEi40ahljGaBnG0yfqdgbnOXqwKfv3xK7H5rCwjUlY2fSX8UaLsyqDdVvo39HZEPBmbMTXGU8z7JGZUZ6mStcvCxJC2kmJlq266J56JnvWTfel20APhbbUbXQSAZTrWDqMry2MHvAIT1omE1aWZM(9CaKNnMIAw8)ozfCZhw(GNnXf0tKHMSvUegCGOxDjI5cIbb2QHhTmYtACDFuTh(J9vOZV1uDkqDA2oMfsaKPuUiJpL8Fgyj7ecQDfQGtjzeUVt03i(f3OR6BdVmwCBFD9yrF7yX(RTvNgl(Bvt1yXH2UohTn2yXmBbLGfBbtqLaNqaQNYeUChLrsstjsbljlJDpLQ(QJV6PR)3v2)tsx1jZyrBP7AJNwRsS)lI9rIA6MVCPD4Sn4g86w75lEi(qQUp6)b',
    },
    {
      name: 'S4 standard',
      difficulty: 'intermediate',
      mdt: '!fw1spUjmq4Fm9EfEW8W37LEbTsUNTAsWSkDTGkcS72l93E9JzyT9IvvqjKHXFpMXJrXu)qj30VVPKs(F)PC7Y84L1rL8nT(f1a7Rvk549PP732nB)rnaUa73Tj8S5T(xG1rXcxjF9Izx7G62(6QEE7PDJrnu5sgJi3VA0VQniMy0VTp)SEz(7JVRgA8P)qB032UVmBrZkQFBb6H92bw0xEigGGA2S)TuC4K4d12l3VC7fMxDH1ZX4agN5JlVTywwvYVmnXRMMCzgiIGPgtNJ01J0jYGLYRpfwhOcpSbaj3XZCvdU8wKMoKgpDnFq3H7QY4x8z7W9zesOjQQKiVR9bx7tGaRlaEtKyPsMtCakUAuCEX3IIVdfFpkErqBwf7uR)oNo8RH5anuXSRpwHwys5Ub5Un84(Z9Z0KZ4hWr(PhbrK6lMiLRUKE4bh0oM6p3A5FSErjfXRcBacWLztwxHT1TyngBfmrPgOZYUmcj0DUJz9NSDogwix1c0B22wSStRfdqvjzrttSKH9m6HZxT4OlIZhhfjAmHrZjmAqH2gD4O4nooQyLC6HsRtCAtwdciUbIBGHCdqwvwKXjV0HcHXxakV3bRdnXvX4dlIQIOko)aWtg5rRw9)gLcLaE8jp(EalDAcOMlqNvgkzCQKzpPa6sN4yqmy(gAv6WxBHHo3h5Y1FzFbZd)Rx2uQ)b',
    },
    {
      name: 'I heard you like Wardens',
      difficulty: 'expert',
      mdt: '!fwv2UUjmq0pM(ABK3xESlp0RQeQseP(gcUjobAOqkl3EV9b(27ySnYqsuvIYIzMZ5mhpJDgoBFw6G51HS0NMYlnfDhNYFRDCkVU6Izk)hWcMM(S0)ymxYsW7qzPhRoDQ6Wy9WBzje7cJvhZsBrM)A(9jZfi4xkQhnwKpm21zAg((yDDwcYgRFL0XNRnVyQ9q6x9lJnNnTnpD81Se(C49MAZHHQ2ganqJxbG6HFMGJ(ygIeItmdWFF06K7SEcfEB)MbV9XrFq(m)6e)6451tp0w32LL(UtNyOtNSr6ikqh3hUWtNCdnu)Zz(NR8YrVH2qCQ10AjvptRdWq1Z2u1kF66TvjAdpHa4r2WMYKnhXCcHS8vfpI9GhzlkIVOMlcU3ueEtr6spr5vP2jcqAwzn)lRoMZbBb1zbq(XkeGzn3Cp3c3Jv3VEyONvUTnEC9SXUwmd9AUKR2uw4i0Iq36Dw3Br66hPOquY4284(KLMSLIhl(FuZqU2eNgdfao0EId9NyPFVkyZy9DmwRcWruUr)oh1LOiAqyiIAsGAsGAc2tnjmZPw3usw3DhvDAVLb9m7T5)iRnmJIxDes8mAK36vX9pqybu9YUQFyd94jhp50vNFHcBbHPf8gIxlV7m6hgEVTP0cNEnARBKUDW2(kT95FcN8UCyB6Xa2KDejhZfujIYeZa9bkIVtk1CKusqcTDzQ3UyzFYo9K(TQ66P89LfJ)QyyS7mC5YqPPzk)qzrvJLXgisV3VWgvQ2r4ifajNi0AIJpSgkjcfJWCjgdQ5w((4Pbt3u(ZT99Vh(Q4WLHo4JP8Ig4kUZTt5JxNLWuE)qrvxFKeOXsGrf74cHcQwMGQfkFjd7Auetr5sfrlv47uZ7lR6NYp22ccP9kCpkWUtwFUSO7CXqj80ktm1SyQ5AOpamvGEIcXzoMjm(obvHKALuYbbPUL50lvxJqLhJQaUALYvcgHk4kKG7HLs2jPmkrIPinIFpy)645P8UQZLdrGlw5wBo3Fv6(Pp75(Fq5o43IqA98T7Uxz)d',
    },
  ],
  nok: [
    {
      name: 'Safely press W',
      difficulty: 'beginner',
      mdt: '!fAvtVTnmm0Fm7EHjL8x37LDXOaENfwtI8QxnIdsSBtVSF7tkI2rK1cbbiXur694xpkBaZVmTt2RtM2NTDVopm9VFp92zRD)B2ltp1pAA)0AF30apLzAp0311V3TPVmnOFH5(dUnC69d9FD6ZJxTM2pEDy26bD)85Z2JtVmpmyAY8BMwPDE3G9d7aHjT6ZZh)JD84ppC10Ov()4IDWUFQF8OdnN7DYb0f3Jnq0xn5UD2GMMc3Vt(NclxqlxgwwrlRcMAYecM5CZcMz7(XHXZM2F01PZ66wjzHjqrubAoxfCU0CWjZsMJTYLNP6Ui0c7QMZGMZaYJgKti(9OrhFCkAaEEeqoL5C3gLU9UQqkkpg0skdvXXUIwUMJ53s7ExDnsQ2Ex(eM(om1r7YtbffqgVsdq6sDi9xfJMMqlxCAQoaI6cO5DDywAFpK1ceb8JbIMxq0rb8kCdujcYTsgUc6n8CvFcNOGVMsLH0vTGEqqNsqNqCb5PI6f5eHik4PiQP)M(kJdq9AJr4Oi8iDBWvrHdJ5jYpAk)CBet(9rmvrT1E7AM6CdnCiLGI62kVcDawKq2uk8BrDgRth)6OsbIsTEUGqktFNbkYvyQs5ISpu0q5u4valtK6ksP5HsgGcf4kEvc8wg7dpAArqSSIJ82Kk(ypC7jbBm3ii6W4E64sCPOvOsyxN(Ab6kOmMFRe4Oe4G8wjvwQwLfPFqmPesfL(rA5qeRe3OQsCL6DjCquQkFGe2)PDC3FDVxWLBVvWKX8Fa',
    },
    {
      name: 'Standard - skip brothers',
      difficulty: 'intermediate',
      mdt: '!fA1spUjmq4Fm9qBLAJWp4HVw1l7fuLyL6nlibZg2qWR4r2nx43ETXgw7zHUkse8W4VVzgpFdWr8h5zdI3g4zzfvIM7t5V0j67NY)lp7vH4cpfDiGNvwxvvFASz4opfRnmwxYZIF(PZhjDxorpZZUv0mk0WDASRt0o8NXMgEAG2zRLSXJnIBIglMwR)ES9jHS9HY34PuI(b9IgXPHAzRcnvG9IcOE1TPiNlPHkptX80i1)d67mMJSMJnMjwZeZsQDjYSm0FzK3YStYgzhp7lvv0GQQvswycrSuHO(Cf5Zf1hC7YyVaBLlntSkh0mEX8zG6Za2pBW(eI)y2qD3UnBq(1re2NYq)Wgdd7JjMsuOlOX2kuIp2jwZmFm)qzxhQozI1RaqGgSCmG8Rke)YWgfA670NS)rV54y2bMJxAkT1iuGFFecTnAAonvjMlAulAHGDBpLrGtDeibXb7f7mBgAJpK)(qaTbc0WI8BGsrjGSCRQHQFzgp1PGfhNSFrgzIegGEeGocGoG2ffUDAZwBBqMwemGNihn1CFtGnUdTXD0EYFtiH)pNUMEftOIbjaoCN6f1Y7m)HVprlXrfPxZ8ggSHG2usWyOKoeihxLqXGimbeHraMT(rW7vbwMcykYRrcOdFL3ea(ldTrF2eb0mcR4aFxqI)ql82kTnMfy6XXUTmodQw5Jc4Hc4HS3ueJMbhduWjG1mhPGZ8tsWNnxXmlatb7)dDGlhWlegT9GnS)4(3du8EJAmIdcO1Nq3lWxFZ6CjNe)jAA9Vm5XNvFEW6xeKvUeuQ3iZIy04eAycMQud6u5NiC0bkjkmGXyjbHQJyTOdzeD)sR4YEuoL3FP(LP8HZIEXuoEk)Q8y)pMYluFqutXDr3u(R1dNv(DUOu(6vrt5u(3KkZ91xRBk6(UYr9hQSIHfa1Q25RQlfTxw96OSh84fE0y3Fyk)HQP87YXP8sz7xhu8x0QUoi1g0BPwV)Nh7vg7exL3uqGmWpLx1jVUaBN4wTCurzrNO4GUc2QYBtXK)pa',
    },
  ],
  rlp: [
    {
      name: 'Safely press W',
      difficulty: 'beginner',
      mdt: '!fwvttnmiq0FmE3jqi8XDV4fgNbpZOnLuJgtCAsu7f)TlewsjmbDANw623(2VElrJ0pQvtMVN0Q7mnpp3n9ZttVC2yQFXmoDB7Gw9LX8MwIUTqRo2200wBbDrlXodZTh1QXlVJoDPOK3RvF(C3SXXz985ZM(PhM760YchwWIA(qN5tthqjy9U5(tMH(7p(TwswOE00zQNAh6TSzZUpSenApkrrFSqH9pRh6goRv300qkAASwKyhaCek7pwszzP99Ix2tXKij7ZPJrrZk(GtyGZsGZk33eTKULSyyjjk5kWqIwT15kWzM3CvibzGDehcosarh760wGs8sntThwYaM9qzADDG77vvXDuCAI6svhkQdanFpYJI5aWYpD8DsUdaptNeb1cbkfOPiYhAFziIjfgdOIDKao7zfqcOq8EgOJVDsSslOKq4Ddtusg0L(ahOvKqhjj7Wj0NmcfRdharXwD0kpPPjj3AdQmo9q0GqJfMnCy44vCvGIlUgOjXMKe7QCRxiYMAiiY5j(tZTjH864QC6KGCh5fX0)4YHG8ZHMLGJSZc)sJaw4c9AEof26mJTjpePXJLquqmi2Ft96oi4bn5weAI)z3obe0mdI1em0rqHwhk07WWvQ4I)BP1JaVDD0EP1)SE6EPgo8Q9jeJlpFysR)f',
    },
    {
      name: 'Standard - skip juggernauts',
      difficulty: 'intermediate',
      mdt: '!fwvtpUjmq0Fm9y1MfBmg8X2UxQQeQsuPEZcwIb8UiteFKKTh43EhhBZcoj7kIum2Z8EV5z7boI)hE2O48ip7jrvXu74C(ytVqu2igg3j7MZr8StcXR8u0UaE2EzvLSeI7nEkwpXKCppBOUexM01E(ip7yr7KqdB5uFVqn(7P2wEAGow7mztp3kokATqAN9PjvTOt9Z9N5PKlqpiAfLJYofGgiWdaqdWWuTOtXMrxGaE5IysdHFW)J6rF4YKBSmqrzxBxpp7lvvKGQkDG41CfzJMSLd30ulhKTCeAxoAlhAgyvl44Io2KmDLa9eg5D0JVDuKGNtmYpshqYnKVZlaCmEtKdLu29Owt(I2CGsnjHcUPJMIq3tIo0IxJwIn7ypuTBBi8NVVz80K1OYSrJcSvoczlDe2JiINSXEehEDzyCA2AcrU9CKZRrrEef5rKFfs8RmM1VmiSWe1XuSJPexTXS7R4lLnfgG8eb1teeprC1rw31ctgorGDLl2vUyFFn2grIhd0TmWwoKzJi6(3dSkXClK(b331MHRYI9IZj4iBCuNNzTm32sY9pgBoWHiB0bZNVypGCgeBZ734IU1cO3OzZ68VBlaBM07SrSiqNJGCwhAP)G9ydo4Z6myqdV9opCy4t6bOFY6E(fOB)sd(S9UKa6jecomokmbfqdXxK5dKy8UqsqeLsWKKGiJMns(769WSSxLh2nN)Jc1C(HEXds1r5WC(xNZ77k6F8FIdnV1)4jPAF)0qZoTiuqQ2U(VlakC)jMeqJscJItcjg(Xy2oAcJIccyycdfsVwb)TqcFqTQRFoVyoVURBpOKcyQoL(7SI58xMQRf9QIjyYcfSCZunOpzDZii9FjlF1gyzJST9KO4OaatQGf)2XoPoHIrynvTnorD9WQsr)W)p',
    },
    {
      name: 'Flamegullet + big pulls',
      difficulty: 'expert',
      affix: 'tyrannical',
      mdt: '!nA12oUjmq0VLQ(y1MfFdB)y3UVuvjuLyL6BiCaZLDP4iUKDZ(aF7DCWolHKOUcuWmEMZCMJhStck5PK4b9BdjXpQluJndtPdvDADwLUFytTzkDkfNe)Qw)sseAtqsCEDrrDg45HKiS1WyDEsmF)ZHh6hfM3ZsI3RAg1wKZg760Td)ESPjjkW6SZs842g9EDJdtN1hhBl1M2FM)wse9i296gD2qTPfqd44oaOEyyKL3r45rhHaE5iBIiWT9jfUHNdwlFk3OxXniLzMgtxs8xlkObffwhXlZn78CWCbhEoMeNz25yAruwCkEV385GdxqOveH(b68R7fnyRyMUmRdcNx4tvhXPcyQtgWZfCekybnSUkCE6QjeYnVt3qEPi86fzrHLXNkiptqE3rCh(iHJjiPDadM12YaHfHoYwom4OalGb0vSLTIDKvSZ7p9w6LNL8ZyPxVqbEwIDSuUIa0veaVIaKlxgNx7flt4srFj6RlNB0LAlJ5LD5sudxH25r)bNVOvt6eL5ifRANPonH5BHCRBihSSBP1(pLCjo8Z9fkIVYV15p0334AB8IM468qEQZ0jREEix0jVSZ)u(5Ra2RJYfVFSR5w7HGiNLW1R68lA)8scYRjyNiJdUDd9C)1Clp(81y4Z9)Z2l2RyZ2NH9FpTLBCUpii9ukft4mIafesWhP5DuoEdHgWcdPyQiGnZ5zk)GDTjo(L6DBMs)HQDkDxN(U62919tPFBkTZO6U)D9UQdD3)ADBE3yF1gljAHqD77(bbcHpi50GqMGW4ccDo)ySCtOqgIccKyQercVKb)rvdNYvy6MsvtPLgtoWefyY0Ap8tpL(8yzPURvncgvTW0vJLa)QlRgaQ)R6SxCoMvv308QwTxdGv3ct(99MABaQbyU2sNF6YY(LLczzPWOIncgbHfybriL85sHibZubNZzugwIOxrmFaWgY9bGjQoDXyZuARXEeoCUT9SYP0NQgBZ1DvAvULHw(yLBWB1xSZQTLDdaqVQqpB)4VoIVRrnak1FHq2EWz7Hg176TMrRW8i8Ve6mh0Dllp7vY)a',
    },
  ],
  uld: [
    {
      name: 'Safely press W',
      difficulty: 'beginner',
      mdt: '!nwvtVnkmq0Fm9(kpJX8X99sVGwjVs7nR2KywLwRq2GPn9s)TxmmgWEXPrbfsmJFZBEZ8mkq9BL0QVAvs5ZnAZhF(05l6UUpF6pk57A9RQA4hmL8WXMMJ77n2pu1OBH(JhuYMDxpZp3)pTUtjF7ztV2b3((lx0NS)Q3yu1mxW0kY(Dg9BAdHjT6p7p9xD7PhpCvvlgFqN2O3Bp2EAaTbIDEaOUHFwdR(AeIACIn18Hl39SHRH7w3klHzDpy9FL7BnTxuYhAAYynnUaqxaiffsyZd386LDPmlemhuvnZj3dwgTlriXWqSfuu5)pbZwcuewv5H)Ty7ImJTRCQifRfWkkJaJkhaijeiU5RGCkYIqkxqlxoTC5nAmbvKRMMzVphLHQdNazdjoBPwRs3vNAetCITbZSU6nLE54OlIj8HioHXzRI4eLimfS(zncr2g1QtWeuBiNOj)(e2QzHLyGhF0p3cL(oDvm0(XpGSpqwIKwLYarynR1mpIquUerzGmzGiWySHRI2r(9DaauCVZJEhgXGYVZfrmGVHnWHVVTLC4CUnveQyyCtXlHvriIPmfq08oFDxDSXhl(KyHSVZjrjFEMYZneIhyyrS9gwz6O3jq3(KWfCePSDieS)OJLMlnmLDeNo7h2(ucmHDEXUH8G9ZJ2hM8voJmEoUBOtJTa3hz7UxgE1y34lgTk1xa',
    },
    {
      name: 'Standard',
      difficulty: 'intermediate',
      mdt: '!TwvtZUjiu0FmDDZaiOY2oDt7cNodDnt(q8n(EenJbtFDt(TxUHlu1QTzrNWeu(4CpNZLlQP6VRvoZ7oTs5o0vFyOwR(HX8MUIUJOv1TnnTNgTUFQRyWaJT(fuu6UDTMs5NVQv3oyhnamNghgmDUVnAT6kcSyCe14rR5MXIyIJ(5XUxm9DFP(DDL4XexnwZjxBFNhnpHU4b6Q)Xk6K)EarflWMQmFd65(g0l8nOp33G(cFd6l9nFVd252W4GN(90oa3PVQo1B7h0Qp00Wjnnj4IyYrmfZXInhlgUQmmY85ydilBs7pUlbUR8ayI58mF(RfBtB(uUewLeHMsqgrPONszZnTCCLfZvubomAXL)vlEIqpwgmrXutSCU5LHGWxkfqmjPlxxWGxYN4iKvyMd07ZXyaSqQjir22rnim5SOovka6c0LXukn7zzHeffICeFw8KfTmMiLlHoEmIYXz4Beu5snfpXJMvYkjrePlILyreWkmQywzrkcYugf918NOGhwDXZN8qfeyy52zVqsgzE26NYPY)vrgQ0KtXwMmIwNCbISTkuqpjHy20S5JeE8mfJGxhYOlsd8Pv7qTnzlDKYhbhEJBIsSETJ3RwlIo)g3EK4t8Uh66fTm22(pM)EWS0(ZwSVioz)h(WIVs)pRyWBbGFQ(JV6)0w6RzQ6OzYk3XL588mcpVquWEqHpYf57KL0Sscrs4YIcEi9gO0Na(O(645l333m0F(((lTw7HH77D933Bn1VycpE9T2lq078Bjqe9Va',
    },
    {
      name: 'Berserkers into boss',
      difficulty: 'expert',
      mdt: '!TA1sVsjmy0FlgJXvs67hBVAIrxqmIRjWaL7GddmYJ7Jn8B3wOLbyaDmXmDOqP98D650VwcHH)imOv9sByWdQ6gv9j91(O8Y2Q(OdvnnHbpRuNc9HEGWG08SS8KUI2xd9rMg6YtddihsF(XJxI)fMgg8uCrNYaAsxDTQS9BDffH(atNTTe0DOq9KQWIPT1p1v(OQQ8lPVe6thErJQqL0MxvQrttVlAGA036dNDzacF0iB8X6IPMOlMAQUyQz6IPMRlMAHUORBnJCFyAn3D91TgC)7bvZ0KQIQ6WG3MLrazztHXflID00LXaTmguBVyJntxYe2Yh5lECIaMWlZMfKXEjTqdbw(dH2jaeTuwy2EYxYnUTzRik(JI4c5GCfhxmelLbSfKrT0xU3m7GyuAhfgWguO1mXUxQzi3vHfTVEsMj4Gn4SbDQvoTEheF)c0ODjwapc5mmHZWKRr2TCbA1n4ERvL3oLgfs5sHe4aeUku0vbWMQaPlwhpBsjTAMfB2DLe5d53NOzwtnobSMTyBVtozXw3fVXIzd(otBNvExtQTimPyO1EItcLRqeTxwQvtNqep3uh8D3kleWU)gcUYoiZtUnPYG9NhK5o3oB8mX6TwKVzgP1H3zZIj(42QbUDQlcThVN8XHvitJhVACoCW)hoPqNCSvIZapm)cQo8t9zvthpfK6cQa4jXyivk46AgMnWHpaL62juehsKyeeXWJ(7iNEWqOGGK46x7JYYRBA7Jmh)9M(OVRox9KQpQ9OQrxDiUjViV5K(i7S6QZdTVyi6JYZ0)BFVUhTv6Z0p3LC0Zq5sDySB1FLUCHhxW5aowcyeb1sxj3dXauisGgVElB)4X48Y5F4qF0Zhv6wo4(Sc9l1ngxx1vM2hrbVBonWZPbY8baqUKaHCgHdOCRQrbEqbKXjiGasiCX)ap(SQ6CCzIJhPQynlInuz(h(exRwWXzuKmNIuKWJizeggqyCkhnYqcL5jfqSaaKaIKZj3YWV2D(IZUUKxuexBSM(Ocv6JQXBBoLF5AKn)c)na',
    },
  ],
}

async function convertRouteDefinition({
  affix,
  difficulty,
  name,
  mdt,
}: SampleRouteDefinition): Promise<SampleRoute> {
  const mdtRoute = await decodeRoute(mdt)
  const route = mdtRouteToRoute(mdtRoute)

  if (name) route.name = name

  return {
    affix,
    difficulty,
    route,
  }
}

export type SampleRoutes = Record<DungeonKey, SampleRoute[]>

const sampleRoutes = dungeonKeys.reduce((acc, key) => {
  acc[key as DungeonKey] = []
  return acc
}, {} as SampleRoutes)

const difficultyToNum = (difficulty: SampleRoute['difficulty']) =>
  difficulty === 'beginner' ? 0 : difficulty === 'intermediate' ? 1 : 2

const affixToNum = (affix: SampleRoute['affix']) =>
  affix === undefined ? 0 : affix === 'fortified' ? 1 : 2

function sortSampleRoutes(route1: SampleRoute, route2: SampleRoute) {
  if (route1.difficulty !== route2.difficulty) {
    return difficultyToNum(route1.difficulty) - difficultyToNum(route2.difficulty)
  }

  if (route1.affix !== route2.affix) {
    return affixToNum(route1.affix) - affixToNum(route2.affix)
  }

  return route1.route.name.localeCompare(route2.route.name)
}

for (const dungeonKey of dungeonKeys) {
  for (const routeDefinition of sampleRouteDefinitions[dungeonKey]) {
    const sampleRoute = await convertRouteDefinition(routeDefinition)
    sampleRoutes[dungeonKey].push(sampleRoute)
  }
  sampleRoutes[dungeonKey].sort(sortSampleRoutes)
}

export default async () => ({
  data: sampleRoutes,
})
