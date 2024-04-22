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
  bh: [],
  hoi: [
    {
      name: 'Safely press W',
      difficulty: 'beginner',
      mdt: '!fw1YUnmiqWpMEVIfJFDVx6fRkrpJsJd06wuCvcUpUKV9cgWLLANklfhwpm7SlZAlaXJcUr(LrWVtQEAsBUSZ8YjPS)f5zZTdJx2DzhvW)ukFt0b3se8ddk1qVf53IoQlW0WbbFCSHQbYKQsl4F8KEs6yUF60j5rZdtATOJ4ahIWN2RLFi1bodrVB64ZYXJ3F4lrhR19GZsTS3mmE0YMvJVBj6S9VDqYpDfwKgRyswAxmloB4IqywiCanlegMxY7h1JNe8BukgrPsOdVzaW5QcNdGGjNg2wfojUu0Qw2yeDDaDJ7EHOR9VsJLsFiNXKaz9H6mTbrC0C1SVXxYLiEzy6AYOl2MJ4yP9GKEvI(DvGdAfkpLr8vH6gQZymRcr9rpJ1oOLBFK672noavjOsSjTRVzxk8nNza1RSzNKdT(MR)42eBbsGTHYaiPjzn)GTPS4YAsmHoC14SepGy5vu0HdqA)OmXR6YwgBPIjHT2LdvWBuiO(yihxBod8ok629F)Hh4TdfOEym6slgUIjGLIGLPZYmER2spXHLaIISJ8IS9trXxzyaQr8WYQlk6u8xDMNh2wJgG3Mu)FdhqlshLz6iU(AwCN5C(nLLr8RmhrjO8uLvxSS6QCRzfQ3zT5C7Y7XNDwuY64w8VUl(4(xTFU588hBmcXp',
    },
    {
      name: 'Standard',
      difficulty: 'intermediate',
      mdt: '!fwvYsUjmq0pMCoU0(Y1u5sYbQuLYzvEtmdXyWfgM45I)2JKvdwS5uydg1p96Lx3YwS93wtR7wR1yA3vDCxZrR5Vo3jBgEdYAowKNxCORS9tBgjSqxHhq3PQZnnFE(g2A(yxzNlWYHUMgxv7V6klTzOawyft3(s3hUsGsy1V3v9MRU6hhVzZy6GHRUs3H2I6kpB(45INOR(FMHtU9GImsmyYO(p(NTHvgBMcMjrZ0v2nl8KnWclbMpcouxw3ynFjpNHYZtCtefhitKqwIVsnNWnnjes8rWd68K9hrlhNEmyZ8XUsclRGirp2LS5PdlfqeLcirdKGrJzHpnG3RIff(i9HnoIvteG(0Vh3qjh1BywXpeVbOIr(PV8I7l)y5egj9iOZl1rgLbO81f9OGOcaKVU)t9AZAW8cIESgQt9XsYzOlTxr6DMaWjh7K(s8mzxdPngfqkwPnEcBPbZWEhkxE5A5YxOflMAacYY40dYlGGoQu57tsYQW78)3mkWaDHtes5dpHVE)jEPsUW8kWiD0yYt)WN4hOVh)QoMGy)yuNpBS75WlWinPzin(xDCfqOxRooOhpAhjO10xax4YuV)p(JUhoT2CSpOySnAobZfifxP46hP6xj(ztMgZuuksZ4cmnobht9VfYBJ5uXLa1v(3HZtgOLiqBusorlPifJibAzk1gowHKeHqiPsXCw)z35l3325)wxDFB77URU7BBQpC669T()(7(23Rl93BkE792NEpCz)h',
    },
    {
      name: 'Big pulls',
      difficulty: 'expert',
      mdt: '!vw1YoUjmu0pMUTfHFB3LvZMwPIQeDTfziMaDyGiEmp2W3E91yNXqsQufsGJ54Z9Co(AIgP)ToFY82Ko)bt1H52PLIP6bJPS2moL00RZF1yEsNHss15hBQQAkTGExNHHjMBoQZ7oKo9kh)25HoD(lhANnaPLZddMUPFn32QZsbW(zYNFS18IP1ZPF2hM7oz67((X30zuf8IrtRPCQPVZYMvENTenAhMHIU5OidVQMmIDPWtQoJbpz6mU95eGylCY60K)pwOE44nSKx232pOZ)uvfnTQkQCROfE0sp5kp5O0TAJ6XX2QTBT8iTSDvx0cOevvepEJgGJcwfr2QcPhGyxcrclKgwik4d8wf58Ldk668Hgd1JNfWZdul2XyiWrK9U8r5AIZaOSOTZn1fQmGIda4EubhrxlM4QiIfKdp4uHVFa5sjUDGBZuyX7mT0oWflk7aNOraxUkHGghh3iOtZroYYo2XoYsp2rpYYp2XpYwaSRairiVrYqCGuFS5jJ2821eq)WCbJhY7qCl2sIk4FF)PYpppQZaw2AXahgN6GpVZUanDTJCTq4Bdd086w6ADj7oZH8v37CeD3UzqfSO1n5YYBFu)QZWkFK59fjk0IRhBxD8Dri5)Ooqpe13cD151W3o85hjk1J1)U1PU0B7du19tFp)oMXP3p(D7sWvE)J)X(j4lF1n)yiS5QeLukOuIqOKyHZQFHsyjekpLiyuoJkzRhFwD(3aBN)J5NpVu0)IzWEFW9Fn9ZNQHbnJlfd9LpLSu8ZdDVVu8SzQU)44xxkAnho)z7BnJLZg7GxBApUuuwFy4e8tZuzci3oBr8Fk7IuX80ePGHvcsQKIfkVuLYegsMkWCoxqe87j1zqUDG(mJMvbA15HoB9R7bvm0CQE6JQdx6)ca',
    },
  ],
  nelth: [],
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
      mdt: '!nwvtZTjmq0Fm9EgTls8X9CPxy6mQN1KySOHwIPdwK6Cj)2ReScSuqoEGXye7(23(2DLuG6NkPrFXOKpQBFEQ38XtMxg16Mx0Nnp0n8XtXxvk5)06)OQHhyk5XU22UgRFVRQr3ctDhvYlIcg)q37JJVQKV9C)K2fNMPXr9jZpM67v1mNX0kYPd96309eM0QpoD6x6HtF)4fvTy(dN196gt3WjlAwg)xlqNT)TgU6NziQXf2uNzVDp52B7tJBLnZmUpC9RYMH(HrL8BTTCwBRZa0zaswHe2zHoF9YUqYdbZbvv7AW9GXjVeHeddXwqwL)zcY3mueMv5HVwSFsYzhkxssX1cyffrGrPdaKece38zqozzriLlOLlxwU8gfMGmYLtRS3hJYq1jJazhjMVLRvPRQlfIfoX2Hzgx(MsVCC0zXc(qeNW4OvrCIceMcwFVgHiBNC1jycQmKt0m7(e2QvHLyGhF033cL(kDvm0(2pWhuEIGwLAaIWAvRzEeHOyfhbAidebdg7mvrEKFFBaaf3B)OFcJyq5xnfrmiB)Xaizt5A5PiuPW4IXNKUQ0sdbzuJUVLc89uGis1jvczF1ief81Mjp5qiUtHfX2Bmdt75Ua6(BbUHJi18gcb(hviwtnm1CiUSPpS)2dyI54T5mmlW)Si)WKN1mZ4v7UHonxcCxYHd)2EM455tenk1)ba',
    },
    {
      name: 'Standard',
      difficulty: 'intermediate',
      mdt: '!TwvtZTniq0Fm9C9ai0hCntV0EqtNHEMrX2OmkMiPOpCC7b)BVSMfIKIuQp0Xmgje7BF7B3fuu1VuYb9LbL8bDxVU7K9)Rfv1dnxl2303RKVP1Nu50DeL8yvzz1HrZWVv5myHXQJk5RNB)ZL3OplE1(Y5hnJAa0dJDD66HFoAmQCcSzCf54EJ(S2GyIR(TX6N0n1F)4fvE8Tp0Rn6ddvn1w0S0R1cuV9XC6K)UbroZXM8i7aM52bmhBhWCIDaZP2bmNzh25bWYTHzaE69ppa4o9v5HgttNs(LYsoPSmaNhtoIz8CSyZXIH7kc9mFo2aYIYG9ERIrRsCGfpNNjZFnDBAZNYf3Uei0ucYikf1ukBUOLG7mDEeLIlJsC2NkXtc09zormEQiMnx8Iqq4ldfiycHUy9ag0s(efHScZgG49(ymaMl14cr22E1fyIzEDAOaOhJQmMsPr3lleyqHi7XN5RSOz(ePyj0(YiQ3P8nCQyzm5R4rXkiLepI0f(APhWomA8S2IGheHmkQRj3rdpS707p5HrGJHzBN9CjzK5rRxLtf)RMmmsdkfBzY4dsNyDP59ofuucq6lPO(AkQVOIrWZdz0f5b(02DO5MSvGesiojEJJIcSET67vBgrPFJJpc8XF4dD9UwgB7eaMaVXSG9rlSZJt0)HBwST6FSLbpga(jB2)S9UTW1zYJEXKLTJls4jreEsACk7gf(kpozNiJgLriccxKMYDPxhLEa4J8hJV0ETOSR5LRfTvgZJDxlGlXn6JpPDp2FQQf8ET1ehru)f',
    },
    {
      name: 'Berserkers into boss',
      difficulty: 'expert',
      mdt: '!TwztpUjmqy4Flvvv9ur(7pUUTsvThqvLEgbbmBydbIat2DVWV9AhSjqc0UvQkoXeJ9mp(DMXogg)R4iT6fDCuKoTopTnpo6zL6qCimaehLxwuuM1xPFnoezhOV0mHo2tz8MIDzNLXrNtR6vwZK132QQ1)OVQkoeyNSBKO(DvQZQkNnDJ(L(6hvn1Fl)L4q6Lx0PQuz6YMAJ1maDYyOoZJHWz)CXeHOrAcXMMTNyA2EQPz7zMMTNBA2EHPz612vUTz02NU(AT1U)DNAinRPQPno69ffeqrXKB8(I4wnDPpql9b1nl24W0LKWw(x(I)obG19YIzozCwsNPHah)qOBdarlLfMBM8LSXDd7erXFuexihKR2X7dXsza7mYOwgk3ANTtmkTJcdyfe02n2BfnlCxfw026jzMGdwHzR1Po50f7G43UangUelmpc5dycFatERL9PlqVp3kxvE)wAuiLlfsG3GWBC1ToWvQaPlYJNTPKonZzB2BQikeYFBIMnNACd4c2I1JDYPqSl6IxpzgUrg31Iz3kNuk0TXI7Ko56sZ1YtNyozsFcf0Nrb9PuiG7Gne8M4azEvTTggS9gHmpKTXjotuVw29QLIUq7gNsmXJ)mg461Si0wCpfaVKAmTE8nRZBh8)HRimvfRvXCHd7NOMDpzUKA6EPOCVtfGajgdPsb30ZWSlm8jO0moHI4qIeJGigEm(oY0dwGIIYsBFDiPOSTtpKyV37Ddj)uDS5SAirVx1z62L2vwv2DOZmV2MJxgFXsgsklmF1F0mdDtZqYX(S9bwKRnUXDg)vC5IaUGZbCSeWicQdxjpaXauisGg)9EA)8(0YAJNQ1gNSRPZ4VN3RmJSt12PApOAnV0myABtFD(qcf8H5yGNJbYEZpKljqiNr4ak3PAuqauazCcciGecx8pWXxvnhtRZ8CKRsnuKAr5bpHxWtTGXzisMJifjcisgHHbegNYrJesOSaPaIfaGeqKCo5Ec)E)Xt(W1PYQQ0wBOziPsL)OA8XUdLNU6z7N4Fd',
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
