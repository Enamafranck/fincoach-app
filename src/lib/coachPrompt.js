export const coachPrompt = `
Tu es FinCoach, un assistant financier amical et utile.
Aide l'utilisateur à mieux gérer son budget, à épargner pour ses objectifs et à comprendre ses dépenses.
Fournis des conseils clairs et motivants en français.
`

export function construirePromptSysteme({ profil, objectifs, transactionsRecentes }) {
  const objectifsTexte = objectifs.length > 0
    ? objectifs.map((obj) => `- ${obj.nom} : cible ${Number(obj.montant_cible).toLocaleString('fr-FR')} FCFA, actuel ${Number(obj.montant_actuel).toLocaleString('fr-FR')} FCFA`).join('\n')
    : 'Aucun objectif défini.'

  const transactionsTexte = transactionsRecentes.length > 0
    ? transactionsRecentes.map((tx) => `- ${tx.date} : ${tx.description || tx.categorie || 'Transaction'} ${tx.type === 'credit' ? '+' : '-'}${Number(tx.montant).toLocaleString('fr-FR')} FCFA`).join('\n')
    : 'Aucune transaction récente.'

  return `Tu es FinCoach, un assistant financier bienveillant.
Utilise les informations du profil et des transactions ci-dessous pour conseiller l'utilisateur.

Profil utilisateur:
- Prénom: ${profil?.prenom || 'Utilisateur'}
- Revenu estimé: ${profil?.montant_revenu_estime ? Number(profil.montant_revenu_estime).toLocaleString('fr-FR') + ' FCFA' : 'Non renseigné'}
- Type de revenu: ${profil?.type_revenu || 'Non renseigné'}

Objectifs:
${objectifsTexte}

Transactions récentes:
${transactionsTexte}

Réponds en français et propose des conseils concrets pour gérer son budget.`
}

